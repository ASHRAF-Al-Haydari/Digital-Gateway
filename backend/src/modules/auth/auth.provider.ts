import { MailerService } from "@nestjs-modules/mailer";
import { CACHE_MANAGER ,Cache} from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import * as crypto from 'crypto';
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class AuthProvider{
  private readonly MAX_ATTEMPT=3;
  private readonly CODE_TTL=60*1000
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache,
              private readonly mailerService:MailerService){}

  async sendEmil(data:CreateUserDto){
    const code = crypto.randomInt(100000,1000000).toString();
    const payload ={
      user:data,
      verified:false,
      attemptNumber:1,
      createdAt: Date.now(),
      codeVerify:code
    }

    await this.cacheManager.set(data.email,payload,this.CODE_TTL)
    const emailTemplate=``

  }
  
  
  async isVerify(code:string):Promise<boolean>{

    return true
  }

}