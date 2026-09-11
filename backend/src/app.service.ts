import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { CustomerUser } from './common/use-data-response';
import { unlink } from 'fs/promises';
import { plainToInstance } from 'class-transformer';
import { PostResponseDto, ProjectResponseDto } from './dto/requests-response-validation.dto';

@Injectable()
export class AppService {
  constructor(private  prismaService : PrismaService){}

      //==========================================create reusable DB Transactions methods=====================
      //this function to check if data rows exist in DB or not
      async checkExistData(ModelName:string,Id:string){
          const model = await this.prismaService[ModelName];
          // const model2 = await this.prismaService['$transaction'];
          if(!model){
              console.error(`Model "${ModelName}" does not exist`)
              throw new InternalServerErrorException({message:"Server filed.",code:"FILED",statusCode:500});
          }
          const data = await model['findUnique']({where:{id:Id}});
              if(!data)
                  throw new NotFoundException({message:`${ModelName} with ${Id} has not data yet`,code:"NOT_FOUND",statusCode:404})
          return data
          }
  
      /**
       * this function for  data transaction by unique or many for all transactions
       *       except create new data pass $transaction value to transactionType parameter
       * @param modelName 
       * @param transactionType 
       * @param query 
       * @returns 
       */
      async transactions(modelName:string,transactionType:string,query:object,exception:HttpException=new NotFoundException({message:`${modelName} has not data yet`,code:"NOT_FOUND",statusCode:404})){
          // if(transactionType === '$transaction'){
          // return  await this.prismaService['$transaction'](query);
          // }
          const model = await this.prismaService[modelName];
          if(!model){
              console.error(`Model "${modelName}" does not exist`)
              throw new InternalServerErrorException({message:"Server filed.",code:"FILED",statusCode:500});
          }
          const data = await model[transactionType](query);
              if(!data)
                  throw exception
                  // throw new NotFoundException({message:`${modelName} has not data yet`,code:"NOT_FOUND",statusCode:404})
           return data
      }
  


      
  getHello(): string {
    return 'Hello World!';
  }
  // ===================================================================user methods=============
  //return user profile data
    async getProfile(Id:string):Promise<any>{
      const user = await this.prismaService.user.findFirst({where:{
        id:Id
      },select:CustomerUser})
      return user 
    }

    //update user profile image
    async updateProfile(imgName:string,body:any,userId:string):Promise<boolean | {}>{
      //get previous image to delete it from files
      const getPreviousImage= await this.prismaService.user.findUnique({where:{
        id:userId
      },select:{
        profileImage:true
      }})

      // console.log(getPreviousImage)
      try{
        await unlink(`./images/profiles/${getPreviousImage?.profileImage}`)
      }catch(e){
        console.log(e)
      }

      //update user profile
      const updateData =await this.prismaService.user.update({where:{
        id:userId
      },data:{
        profileImage:imgName,
        username:body.username,
        fullName:body.fullName
      },select:{
        profileImage:true,
        username:true,
        fullName:true
      }})

      // console.log(updateData)
      if(!updateData)
        return false
      return updateData
    }

    //new user post
    async newUserPosted(cont:string,userId:string):Promise<{}>{
      const userPost = await this.prismaService.post.create({data:{
        content:cont,
        // authorId:userId,
        author:{
          connect:{id:userId}
        }
      }});
      if(!userPost)
        throw new InternalServerErrorException({message:"Failed receive your post. try again.",code:"FAILED",statusCode:500})

      return {message:"Success save your post.",code:"SUCCESS",statusCode:201}
    }
  
    async getUsersPosts(){
      const posts = await this.prismaService.post.findMany({where:{published:true},select:{
        content:true,
        author:{select:{fullName:true,username:true,profileImage:true}}
      },take:3});
      //check if no posts yet
      if(!posts || posts.length===0)
        throw new NotFoundException({message:"No posts yet.",code:"NO_POSTS",statusCode:404})

      return plainToInstance(PostResponseDto,posts,{excludeExtraneousValues:true})
    }

    async getProjects(){
      const projects= await this.prismaService.project.findMany({select:{
        id:true,
        title:true,
        category:true,
        shortDescription:true,
        description:true,
        slug:true,
        projectUrl:true,
        images:{select:{imageUrl:true}},
      },orderBy:{createdAt:'asc'}});

          //check if no posts yet
        if(!projects || projects.length===0)
          throw new NotFoundException({message:"No projects yet.",code:"NO_PROJECTS",statusCode:404})
        return plainToInstance(ProjectResponseDto,projects,{excludeExtraneousValues:true})
    }
 
}
