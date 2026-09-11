import { BadRequestException, Inject, Injectable, NotFoundException, RequestTimeoutException, UnauthorizedException } from "@nestjs/common";
import { CreateUserDto } from "../auth/dto/create-user.dto";
import { MailerService } from "@nestjs-modules/mailer";
import { CACHE_MANAGER ,Cache} from "@nestjs/cache-manager";
import * as crypto from 'crypto';
import * as ejs from 'ejs';
import * as path from 'path';

type verifyPayload={
    user:CreateUserDto,
    verified:boolean,
    attemptNumber:number,
    TryAgainAfter:number,
    createdAt:number,
    firesCodeCreatedAt:number,
    codeVerify:string
}
@Injectable()
export class MailService{
  private readonly MAX_ATTEMPT=3;
  //detect time to be cashed user code verify ago
  private readonly CODE_TTL=5*60*1000 //5 minutes

  //detect time to be cashed user data ago
  private  readonly USER_TTL=24*60*60*1000 //1 day
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache,
              private  mailerService:MailerService){}

  async sendEmil(data:CreateUserDto){
    const code = crypto.randomInt(100000,1000000).toString();
    const payloadCashed:verifyPayload | undefined = await this.cacheManager.get(data.email)
    //check if the cashed user data is exist
    //if it exist , we check if it blocked to som time or no 
    if(payloadCashed){
        //1-convert last try verify code to minutes by use createdAt contain time set to it 
        //2-check if the blocked tries time end to allow to user register again
        if(payloadCashed.TryAgainAfter < (((Date.now() - payloadCashed.createdAt)/1000)*60))
            await this.cacheManager.del(payloadCashed.user.email)
        else
                throw new UnauthorizedException({
                message:`You tried to register more so you can not register now. Try register again after ${payloadCashed.TryAgainAfter-(((Date.now() - payloadCashed.createdAt)/1000)*60)}m`,
                code: "INVALID_ATTEMPT_NUMBER",
                statusCode:401
            })
    }
    const payload:verifyPayload ={
      user:data,
      verified:false,
      attemptNumber:0,
      TryAgainAfter:0,//minutes
      createdAt: Date.now(),
      firesCodeCreatedAt:Date.now(),
      codeVerify:code
    }


     
    await this.cacheManager.set(data.email,payload,this.USER_TTL)
    const emailHtml = await this.renderOtpTemplate({
        code:payload.codeVerify,
        createdAt: `${(payload.createdAt - Date.now())/1000}`,
        expiredAt:`${this.CODE_TTL/1000}`
    },'emailVerify');

    await this.mailerService.sendMail({
        from:"ashraf@DigitalGateway.com",
        to:`${data.email}`,
        html:`${emailHtml}`
    });

    return {email:data.email}

  }
  
  
  async isVerify(code:string,email:string):Promise<{isverify:boolean,user:CreateUserDto}>{
    const data:verifyPayload | undefined =await this.cacheManager.get(email)
        if(!data){
            throw new NotFoundException({
                message:"Register user before verify email",
                code: "NON_EXIST_USER",
                statusCode:404})
        }
        if(data.attemptNumber >= this.MAX_ATTEMPT){
            data.TryAgainAfter= data.TryAgainAfter==0?data.TryAgainAfter + 15 : data.TryAgainAfter *2
            await this.cacheManager.set(data.user.email,data,(this.USER_TTL - data.firesCodeCreatedAt))//to make expire time no change
            throw new UnauthorizedException({
                message:`You tried more than 3 times. Try register again after ${data.TryAgainAfter}m`,
                code: "INVALID_ATTEMPT_NUMBER",
                statusCode:401
            })
        }
        
        //expire time  in seconds
        const elapsedSeconds = (Date.now() - data.createdAt) /1000
        if((elapsedSeconds/60) >= this.CODE_TTL){
            await this.cacheManager.del(data.user.email)
            throw new RequestTimeoutException({
                message:"Time to enter verify code is expired. Try register again to get new verify code.",
                code: "CODE_EXPIRED",
                statusCode:408
            })
        }


        // check code if it valid or not
        if(code !== data.codeVerify){
            const newCode = crypto.randomInt(100000,1000000).toString();
            data.attemptNumber = data.attemptNumber+1
            data.codeVerify=newCode
            data.createdAt = Date.now()
            //to make expire time no change
        await this.cacheManager.set(data.user.email,data,(this.USER_TTL - data.firesCodeCreatedAt))
        //new render
        const emailHtml = await this.renderOtpTemplate({
            code:data.codeVerify,
            createdAt: `${(data.createdAt - Date.now())/1000}`,
            expiredAt:`${this.CODE_TTL/1000}`
        },'emailVerify');
        //send new code 
        await this.mailerService.sendMail({
            from:"ashraf@DigitalGateway.com",
            to:`${data.user.email}`,
            html:`${emailHtml}`
        });
            throw new BadRequestException({
                message:`Entered verify code is wrong. try new verify code send to your email.`,
                code: "INVALID_CODE",
                statusCode:400
            })
        }
        
        const user:CreateUserDto = data.user
        await this.cacheManager.del(data.user.email)
        return { isverify:true, user:user}
  }

  async renderOtpTemplate(data:any,templateName:string){
    const templatePathe= path.join(__dirname,'templates',`${templateName}.ejs`);
    console.log(templatePathe)
    return await ejs.renderFile(templatePathe,data);
  }
}