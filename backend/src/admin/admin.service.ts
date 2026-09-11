import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { PostsResponseDto, ProjectResponseDto, UpdateProjectDto, UploadProjectsDto, UserPostsResponseDto } from "./dto/upload-projects.dto";
import { unlink } from "fs/promises";
import { plainToInstance } from "class-transformer";
@Injectable()
export class AdminDashboardService{
    constructor( private readonly prismaService:PrismaService){}

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











//=====================================================================================================================

    //create new project
    async uploadNewProjects(images:{}[],projectDto:UploadProjectsDto){
        const project = await this.prismaService.project.create({
            data:{
                category:projectDto.type,
                slug:projectDto.slug,
                title:projectDto.projectName,
                createdAt: new Date(),
                description:projectDto.description,
                projectUrl:projectDto.visitUrl,
                shortDescription:projectDto.shortDescription,
                images:{createMany:{data:images}}
            }
        });

        if(!project)
            throw new InternalServerErrorException({
        message:"Failed to upload new project.",
        code:"FAILED_SERVER",
        statusCode:500
        })
    return {message:'success upload project',code:"SUCCESS",statusCode:201}
    }


    //update project images
    async updateImageProject(image:string,imageID:string,projectID:string){
        //check if project exist
        const preproject = await this.prismaService.gallery.findUnique({where:{id:imageID, AND:{projectId:projectID}},select:{id:true,imageUrl:true}});
        if(!preproject)
            throw new NotFoundException({message:"No image or project exist",code:"NOT_FOUND",statusCode:404});

        const project = await this.prismaService.gallery.update({where:{id:imageID},data:{imageUrl:image}});

        if(!project)
            throw new InternalServerErrorException({
        message:"Failed to update new project image.",
        code:"FAILED_SERVER",
        statusCode:500
        })

        try{
                await unlink(`./images/projects/${preproject.imageUrl}`)
              }catch(e){
                console.log(e)
              }

    return {message:'success updated project image',code:"SUCCESS",statusCode:201}
    }
    //update project
    async updateProject(projectDto:UpdateProjectDto){
        //check if exist
        await this.checkExistData('projects',projectDto.projectId);
        const updatedProject = await this.prismaService.project.update({where:{id:projectDto.projectId},data:{
            projectUrl:projectDto.visitUrl,
            title:projectDto.projectName,
            updatedAt:new Date(),
            category:projectDto.type,
            description:projectDto.description,
            shortDescription:projectDto.shortDescription,
            slug:projectDto.slug
        }});

        if(!updatedProject)
            throw new InternalServerErrorException({
        message:"Failed to update project.",
        code:"FAILED_SERVER",
        statusCode:500
        })

        return {message:"success updated.",code:"SUCCESS",statusCode:201}
    }

    //delete projects
    async deleteProject(projectID:string){
        
        const deletedRows = await this.prismaService.$transaction(async (prisma)=>{
            //get images to remove them from files and check if project id is correct
            const deletedImages = await prisma.gallery.findMany({where:{projectId:projectID}});
             if(!deletedImages)
                throw new NotFoundException({
                            message:"No project exist",
                            code:"NOT_FOUND",
                            statusCode:404
                            })
            //deleted child project images
            await prisma.gallery.deleteMany({where:{projectId:projectID}})
            console.log(`project images ${deletedImages.length} deleted rows.`)
            for(const image of deletedImages)
                try{
                await unlink(`./images/projects/${image.imageUrl}`)
              }catch(e){
                console.log(e)
              }

              return await prisma.project.delete({where:{id:projectID}});
        });

        return {message:`success project ${deletedRows} rows deleted.`,code:"SUCCESS",statusCode:200}
    }

    //return all projects
    async getProjects(){
        try{       
                const projects = await this.prismaService.project.findMany({include:{images:{omit:{projectId:true}}}});
        if(!projects)
            throw new NotFoundException({
      message:"No  project yet",
      code:"NOT_FOUND",
      statusCode:404
    })

    return plainToInstance(ProjectResponseDto,projects,{excludeExtraneousValues:true})
            }catch(e){
            throw new InternalServerErrorException({
        message:"throw when server field to fetch projects data",code:"FIELD",statusCode:500})
            }
    }


//===============================================posts====================================
   //get all post
    async getPosts(){
        try{       
            const posts = await this.prismaService.post.findMany({include:{author:{select:{fullName:true,username:true,email:true,profileImage:true}}}});
        if(!posts || posts.length ===0)
            throw new NotFoundException({
            message:"No  posts yet",
            code:"NOT_FOUND",
            statusCode:404
            })

    return plainToInstance(PostsResponseDto,posts,{excludeExtraneousValues:true})
            }catch(e){
            throw new InternalServerErrorException({
        message:"throw when server field to fetch posts data",code:"FIELD",statusCode:500})
            }
    }
    
    //modify posts to published or not published
    async modifyPost(postID:string,isPublished:boolean){
        //check existing post
        await this.checkExistData('post',postID)
        const update = await this.prismaService.post.update({where:{id:postID},data:{published:isPublished}})
        if(!update)
        throw new InternalServerErrorException({
        message:"Failed to update post.",
        code:"FAILED_SERVER",
        statusCode:500
        })

        return {message:"success updated.",code:"SUCCESS",statusCode:201}
    }

    //delete post
    async deletePost(postID:string){
    //check existing post
    await this.checkExistData('post',postID)
    const deleted = await this.prismaService.post.delete({where:{id:postID}})
    if(!deleted)
    throw new InternalServerErrorException({
    message:"Failed to delete post.",
    code:"FAILED_SERVER",
    statusCode:500
    })
    return {message:"success delete 1 row.",code:"SUCCESS",statusCode:200}
    }

    //get all user posts
    async getAllUserPosts(userID:string){
    //check existing post
    const userPosts = await this.prismaService.user.findUnique({where:{id:userID},include:{posts:true}});
    if(!userPosts || userPosts.posts.length ===0)
        throw new NotFoundException({
    message:"User did not have posts yet.",code:"NOT_FOUND",statusCode:404})
            // console.log(userPosts)
    return plainToInstance(UserPostsResponseDto,userPosts,{excludeExtraneousValues:true})
    }
    
    //delete all user posts
    async deleteAllUserPosts(userID:string){
    //check existing post
    const userPosts = await this.prismaService.post.findMany({where:{authorId:userID}});
    if(!userPosts || userPosts.length ===0)
        throw new NotFoundException({
    message:"User did not have posts yet.",code:"NOT_FOUND",statusCode:404})

    const deletedRows = await this.prismaService.post.deleteMany({where:{authorId:userID}})
    if(!deletedRows)
    throw new InternalServerErrorException({
    message:"Failed to delete post.",
    code:"FAILED_SERVER",
    statusCode:500
    })
    return {message:`success ${deletedRows.count} rows deleted.`,code:"SUCCESS",statusCode:200}
    }

    //delete all posts
    async deleteAllPosts(){
    //check existing post
    const deletedRows = await this.prismaService.post.deleteMany({})
    if(!deletedRows)
    throw new InternalServerErrorException({
    message:"Failed to delete posts.",
    code:"FAILED_SERVER",
    statusCode:500
    })
    return {message:`success ${deletedRows.count} rows deleted.`,code:"SUCCESS",statusCode:200}
    }
//================================================end post===============================


}