import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, InternalServerErrorException, Param, ParseBoolPipe, Patch, Post, Query, Req, Res, UploadedFile, UploadedFiles, UseFilters, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ApiOperation, ApiConsumes, ApiBody, ApiCreatedResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiBearerAuth, ApiInternalServerErrorResponse, ApiTags, ApiNotFoundResponse, ApiParam, ApiOkResponse, ApiQuery } from "@nestjs/swagger";
import { UserRole } from "src/common/enum";
import { UploadFilesExceptionFilter } from "src/exceptionFilter/upload.exception.filter";
import { Roles } from "src/modules/auth/decorators/user-roles.decorator";
import { JwtGuard } from "src/modules/auth/Guards/jwt.auth.guard";
import { ContactMassageResponseDto, CreateServicesRequestDto, CreateSettingsRequestDto, CreateTechnologyRequestDto, PostsResponseDto, ProjectResponseDto, ServicesRequestDto, ServicesResponseDto, SettingsRequestDto, SettingsResponseDto, TechnologyRequestDto, TechnologyResponseDto, UpdateProjectDto, UpdateProjectImageDto, UploadProjectsDto, UserPostsResponseDto, UsersResponseDto } from "./dto/upload-projects.dto";
import { AdminDashboardService } from "./admin.service";
import { multerConfig } from "src/common/Multer.config";
import * as express from 'express'
import { ParseCUUIDPipe } from "src/pipe/parescuuidpipe";
import { plainToInstance } from "class-transformer";
import * as fs from 'fs/promises'
import { ParseImageNamePipe } from "src/pipe/parseImagesNamePipe";
import { join } from "path";
@ApiTags("Admin-Dashboard")
@Controller('dashboard')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@UseGuards(JwtGuard)
@ApiUnauthorizedResponse({
        description:"JWT missing token, or expired",
        examples:{
          0:{
            summary:"Authentication token is required",
            value:'TOKEN_MISSING'
          },
          1:{
            summary:"Access token has expired",
            value:"TOKEN_EXPIRED"
          },
          2:{
            summary:"Invalid access token. Please log in again.",
            value:"TOKEN_INVALID"
          },
    
          3:{
            summary:"Token is not active yet.",
            value:"TOKEN_NOT_ACTIVE"
          },
    
          4:{
            summary:"Authentication failed",
            value:"AUTH_FAILED"
          },      
        },    
        })
@ApiForbiddenResponse({
        description:"You have not permission .",
        example:{
                message:'You have not permission to access',
                code: 'PERMISSION_DENIED',
                statusCode: 403,
            }
  })
export class AdminDashboard{
  constructor(private readonly adminService:AdminDashboardService){}
//===========================================users=======================================
//get all users
 @Get('users')
 @HttpCode(HttpStatus.OK)
 @ApiOperation({
  summary:"Fetch all users.",
  description:"this route provide to you to fetch all users."
 })
  @ApiOkResponse({
  description:"Success fetch all  users",
  example:[
  {
    "role": "ADMIN",
    "profileImage": "1787097518102-830313047.jpg",
    "lastLoginAt": "2026-08-02T22:51:39.209Z",
    "userId": "cmscea6ja0000c4db3o2plaad",
    "userFullName": "ashraf abdul-fattah hazaea",
    "userName": "ashrafhs1",
    "email": "useremail@gmail.com",
    "provider": null,
    "createdAt": "2026-08-02T22:51:39.286Z",
    "updatedAt": "2026-08-18T23:58:38.129Z"
  },
  {
    "role": "CUSTOMER",
    "profileImage": "1786665456082-853792458.png",
    "lastLoginAt": "2026-08-03T00:34:57.016Z",
    "userId": "cmschz0qy000114dbdse6b81v",
    "userFullName": "ali mohammed ali",
    "userName": "ali12s",
    "email": "alialosh123@gmail.com",
    "provider": null,
    "createdAt": "2026-08-03T00:34:57.034Z",
    "updatedAt": "2026-08-03T00:34:57.034Z"
  }]
 })
  @ApiNotFoundResponse({
    description:"no users yet.",
    example:{
      message:"No  users yet",
      code:"NOT_FOUND",
      statusCode:404
    }

  })
  @ApiInternalServerErrorResponse({
    description:"throw when server field to fetch users data.",
    example:{
        message:"throw when server field to fetch users data",code:"FIELD",statusCode:500}
  })
 async getAllUsers(){
  const users= await this.adminService.transactions('user','findMany',{})
  return plainToInstance(UsersResponseDto,users,{excludeExtraneousValues:true})
 }

   //send user profile image to client
   @Get('user/profile/:name')
   @HttpCode(HttpStatus.OK)
   @ApiOperation({summary:"User profile image", description:"Get user profile image "})
   @ApiOkResponse({description:"send user profile image",})
   @ApiBadRequestResponse({
     description:"If server can not send file image to user due any reason",
     example: {
           message:"Notfound Profile image file, check the correct name and try again",
           statusCode:"NOT_FOUND",
           code:404
         }
   })
   @ApiParam({
     name:"name",
     description:"Add image name with extension.",
     example:"872397464-209274.png",
     type:String,
     required:true
   })
  async getProfileImage(@Param('name',ParseImageNamePipe) profile_url:string,@Res() res:express.Response) {
         await this.adminService.transactions('user','findFirst',{where:{profileImage:profile_url}})
     try{
     res.sendFile(profile_url, {
       root: join(process.cwd(), 'images/profiles'),
       headers: {
         'Content-Type': 'image/png',
         'Content-Disposition': 'inline'
       }
     });
   }catch(e){
     throw new BadRequestException({
       message:"Notfound Profile image file, check the correct name and try again",
       statusCode:"NOT_FOUND",
       code:404
     })
   }
 }

  //create new project==================================================================projects=====================================
  @Post('new-project')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
            summary:"Upload our projects.",
            description:"Upload project images."
  })
  @ApiBody({
            description: 'Note:Select a images to upload. Max size: 3MB,MaxCount:3. Allowed: PNG, JPEG, JPG.',
            type: UploadProjectsDto,
  })
  @ApiCreatedResponse({
            description:"Files [file1,file2,...] uploaded.",
            example:{message:`Success 3 files uploaded.`,
                    filesName:['file1,file2,...'],
                    statusCode:201}
  })
  @ApiBadRequestResponse({
            description:"Invalid uploaded files type. files type must one of PNG, JPEG, ore JPG.",
            example:{
                        message:'Invalid file type',
                        code:"INVALID_FILE",
                        statusCode:400
                    }
  })
  @ApiBadRequestResponse({
            description:"Count uploaded files more then 3. files maximum number 3.",
            example:{
                        message:'Invalid files count',
                        code:"LIMIT_FILE_COUNT",
                        statusCode:400
                    }
  })
  @ApiInternalServerErrorResponse({
    description:"throw when try to save data of project.",
    example:{
        message:"Failed to upload new project.",
        code:"FAILED_SERVER",
        statusCode:500
        }
  })
  @UseInterceptors(FilesInterceptor('projectImages',3,multerConfig(3,3,'projects')))
  @UseFilters( UploadFilesExceptionFilter)
  async uploadProjects(@UploadedFiles() files :Array<Express.Multer.File>,@Body() body: UploadProjectsDto,@Req() req){ 
    const filesReallyName = files.map(file=>({imageUrl:file.filename}))
      //   // console.log(filesReallyName)
        const projects = await this.adminService.transactions('project','create',{
            data:{
                category:body.type,
                slug:body.slug,
                title:body.projectName,
                createdAt: new Date(),
                description:body.description,
                projectUrl:body.visitUrl,
                shortDescription:body.shortDescription,
                images:{createMany:{data:filesReallyName}}
            }
        },new InternalServerErrorException({message:"Server filed to create new data",code:"FILED",statusCode:500})
      );//end transaction fun
        req['filePath']=undefined
        return {message:'success upload project',code:"SUCCESS",statusCode:201}
        // return await this.adminService.uploadNewProjects(filesReallyName,body)
        }



 //update project data
 @Patch('update-project')
 @HttpCode(HttpStatus.CREATED)
 @ApiOperation({
  summary:"Enter data project you want to updated.",
  description:"this route provide to you update your project data."
 })
 @ApiBody({
  description:"update your project data with these contain payload, the projectID is required and necessary.",
  type:UpdateProjectDto
 })
 @ApiCreatedResponse({
  description:"Success updated your data project",
  example:{message:"success updated.",code:"SUCCESS",statusCode:201}
 })
  @ApiBadRequestResponse({
    description:"Data validation error."
  })
   @ApiNotFoundResponse({
    description:"the  project id is un correct.",
    example:{
      message:"No  project exist",
      code:"NOT_FOUND",
      statusCode:404
    }

  })
  @ApiInternalServerErrorResponse({
    description:"throw when try to save data of project.",
    example:{
        message:"Failed to update project.",
        code:"FAILED_SERVER",
        statusCode:500
        }
  })
 async updateProject(@Body() updateProject:UpdateProjectDto){
  await this.adminService.checkExistData('project',updateProject.projectId)
  await this.adminService.transactions('project','update',{where:{id:updateProject.projectId},data:{
            projectUrl:updateProject.visitUrl,
            title:updateProject.projectName,
            updatedAt:new Date(),
            category:updateProject.type,
            description:updateProject.description,
            shortDescription:updateProject.shortDescription,
            slug:updateProject.slug
        }},new InternalServerErrorException({
        message:"Failed to update project.",
        code:"FAILED_SERVER",
        statusCode:500
        }))
        return {message:"success updated.",code:"SUCCESS",statusCode:201}
  // return await this.adminService.updateProject(updateProject)
 }

  //update project image
  @Patch('update-project-image/:imageId')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
            summary:"update the project image.",
            description:"update project image."
  })
  @ApiBody({
            description: 'Note:Select a images to upload. Max size: 3MB,MaxCount:1. Allowed: PNG, JPEG, JPG.',
            type: UpdateProjectImageDto,
  })
  @ApiCreatedResponse({
            description:"Success project image updated.",
            example:{message:`Success project image updated.`,
                    filesName:"file1 uploaded",
                    code:"SUCCESS",
                    statusCode:201}
  })
  @ApiBadRequestResponse({
            description:"Invalid uploaded file type. file type must one of PNG, JPEG, ore JPG.",
            example:{
                        message:'Invalid file type',
                        code:"INVALID_FILE",
                        statusCode:400
                    }
  })
  @ApiBadRequestResponse({
            description:"Count uploaded file more then 1. file maximum number 1.",
            example:{
                        message:'Invalid file count',
                        code:"LIMIT_FILE_COUNT",
                        statusCode:400
                    }
  })
  @ApiNotFoundResponse({
    description:"the image  id is un correct.",
    example:{
      message:"No image exist",
      code:"NOT_FOUND",
      statusCode:404
    }

  })
  @ApiInternalServerErrorResponse({
    description:"throw when try to save data of project.",
    example:{
        message:"Failed to update project image.",
        code:"FAILED_SERVER",
        statusCode:500
        }
  })
  @ApiParam({
    name:"imageId",
    allowEmptyValue:false,
    description:"Image id that you want to updata it.",
    example:"imageId=gshdhsdsf4sdshgdhsgds"
  
  })
  @UseInterceptors(FileInterceptor('projectImage',multerConfig(3,1,'projects')))
  @UseFilters( UploadFilesExceptionFilter)
  async updateProjectImage(@UploadedFile() file :Express.Multer.File,@Param('imageId',ParseCUUIDPipe) imageId:string,@Req() req){
        // const filesReallyName = file.filename
        // console.log(file)
        const preImage=await this.adminService.checkExistData('gallery',imageId)
        await this.adminService.transactions('gallery','update',{where:{id:imageId},data:{imageUrl:file.filename}},new InternalServerErrorException({
        message:"Failed to update new project image.",
        code:"FAILED_SERVER",
        statusCode:500
        }));
        await fs.unlink(`./images/projects/${preImage.imageUrl}`)
        req['filePath']=undefined
        return {message:'success updated project image',code:"SUCCESS",statusCode:201}
        // return await this.adminService.updateImageProject(filesReallyName,imageId,projectId)
  }

//delete project by id
@Delete('del-project/:projectId')
 @HttpCode(HttpStatus.OK)
 @ApiOperation({
  summary:"Enter project id to delete it.",
  description:"this route provide to you to delete the project."
 })
   @ApiParam({
    name:"projectId",
    allowEmptyValue:false,
    description:"project id that you want to delete. it",
    example:"projectId=gshdhsdsf4sdshgdhsgds"
  
  })
 @ApiOkResponse({
  description:"Success delete your  project",
  example:{message:`success project 1 rows deleted.`,code:"SUCCESS",statusCode:200}
 })
  @ApiBadRequestResponse({
    description:"project id parameter validation error."
  })
   @ApiNotFoundResponse({
    description:"the  project id is un correct.",
    example:{
      message:"No  project exist",
      code:"NOT_FOUND",
      statusCode:404
    }

  })
  @ApiInternalServerErrorResponse({
    description:"throw when try to delete project data.",
    example:{
        message:"Failed to delete project.",
        code:"FAILED_SERVER",
        statusCode:500
        }
  })
 async deleteProject(@Param('projectId',ParseCUUIDPipe) projectId:string){
  await this.adminService.checkExistData('project',projectId);
  const imagesUrls = await this.adminService.transactions('gallery','findMany',{where:{projectId:projectId}});
  const deleted= await this.adminService.transactions('gallery','deleteMany',{where:{projectId:projectId}},new InternalServerErrorException({message:"Server filed delete project",code:"FILED",statusCode:500}));
  console.log(deleted.count+'rows deleted.')
  try{
    for(const imgUrl of imagesUrls)
      await fs.unlink(`./images/projects/${imgUrl.imageUrl}`);
  }catch(e){
    console.log(e)
  }
  await this.adminService.transactions('project','delete',{where:{id:projectId}},new InternalServerErrorException({message:"Server filed delete project",code:"FILED",statusCode:500}));
  return {message:`success 1 row project deleted.`,code:"SUCCESS",statusCode:200}
  // return await this.adminService.deleteProject(projectId)
 }

 //get all projects
 @Get('projects')
 @HttpCode(HttpStatus.OK)
 @ApiOperation({
  summary:"Fetch all projects.",
  description:"this route provide to you to fetch all projects."
 })
  @ApiOkResponse({
  description:"Success fetch all  projects",
  example:[
    {
    projectId: "jhhjsghshs75",
    projectName: "Tag-mole",
    slug: "Tag-Mole-web-store",
    shortDescription: "ahgsahga agsahjhgj ajgjh",
    description: "jhjkhgdhs sdhgsd sd gdjhgd sjghd shdg sgdhgj hgdhjgdgs",
    type: "web",
    visitUrl:"https://tagMole.com",
    projectImages: [
      {
        id:"jhsjghdhgddkjkshd",
      imageUrl:"5454dsjh6564-54.png"
      },
            {
        id:"jhsjghdhgddkjkshd",
      imageUrl:"5454dsjh6564-54.png"
      },
            {
        id:"jhsjghdhgddkjkshd",
      imageUrl:"5454dsjh6564-54.png"
      }
    ],
    createdAt: '10/9/2026 12.53AM',
    updatedAt: '10/9/2026 12.53AM',
    },
    
    {
    projectId: "jhhjsghshs75",
    projectName: "Ali-Baba",
    slug: "Ali-Baba-web-store",
    shortDescription: "ahgsahga agsahjhgj ajgjh",
    description: "jhjkhgdhs sdhgsd sd gdjhgd sjghd shdg sgdhgj hgdhjgdgs",
    type: "MOBILE",
    visitUrl:"https://aliBaba.com",
    projectImages: [
      {
        id:"jhsjghdhgddkjkshd",
      imageUrl:"5454dsjh6564-54.png"
      },
            {
        id:"jhsjghdhgddkjkshd",
      imageUrl:"5454dsjh6564-54.png"
      },
            {
        id:"jhsjghdhgddkjkshd",
      imageUrl:"5454dsjh6564-54.png"
      }
    ],
    createdAt: '10/9/2026 12.53AM',
    updatedAt: '10/9/2026 12.53AM',
    },

  ]
 })
  @ApiNotFoundResponse({
    description:"no projects yet.",
    example:{
      message:"No  project yet",
      code:"NOT_FOUND",
      statusCode:404
    }

  })
  @ApiInternalServerErrorResponse({
    description:"throw when server field to fetch projects data.",
    example:{
        message:"throw when server field to fetch projects data",code:"FIELD",statusCode:500}
  })
 async getAllProjects(){
  const projects = await this.adminService.transactions('project','findMany',{include:{images:{omit:{projectId:true}}}});
  return plainToInstance(ProjectResponseDto,projects,{excludeExtraneousValues:true});
  // return await this.adminService.getProjects();
 }

   //send project images to user
   @Get('project/images/:name')
   @HttpCode(HttpStatus.OK)
   @ApiOperation({summary:"project image", description:"Get project image "})
   @ApiOkResponse({
     description:"send project  image",
   })
   @ApiBadRequestResponse({
     description:"If server can not send file image to user due any reason",
     example: {
           message:"Notfound project image file, check the correct name and try again",
           statusCode:"NOT_FOUND",
           code:404
         }
   })
   @ApiParam({
     name:"name",
     description:"Add image name with extension.",
     example:"872397464-209274.png",
     type:String,
     required:true
   })
   async getProjectImage(@Param('name',ParseImageNamePipe) image_url:string,@Res() res:express.Response) {
     await this.adminService.transactions('gallery','findFirst',{where:{imageUrl:image_url}})
   try{
     res.sendFile(image_url, {
       root: join(process.cwd(), 'images/projects'),
       headers: {
         'Content-Type': 'image/png',
         'Content-Disposition': 'inline'
       }
     });
   }catch(e){
     throw new BadRequestException({
       message:"Notfound project image file, check the correct name and try again",
       statusCode:"NOT_FOUND",
       code:404
     })
   }
 }
 //===============================================================================end project========================================================
 //=============================================================================== post ========================================================

//get all posts
 @Get('posts')
 @HttpCode(HttpStatus.OK)
 @ApiOperation({
  summary:"Fetch all posts.",
  description:"this route provide to you to fetch all post."
 })
  @ApiOkResponse({
  description:"Success fetch all  posts",
  example:[  {
    "user": {
      "userFullName": "ashraf abdul-fattah hazaea fazaea",
      "userName": "ashraf235",
      "email":"useremail@gmail.com",
      "profileImage": "1787097518102-830313047.jpg"
    },
    "userPost": "this is the best digital software development platform, they provide more useful software services",
    "postId":"jhjhgsdgshdsdksjdsss",
    "published":true
  },  {
    "user": {
      "userFullName": "gopran abdul-fattah hazaea fazaea",
      "userName": "gobran45",
      "email":"useremail@gmail.com",
      "profileImage": "1787097518102-830313747.jpg"
    },
    "userPost": "this is the best digital software development platform, they provide more useful software services",
    "postId":"jhjhgsdgshdsdksjdsss",
    "published":false
  }]
 })
  @ApiNotFoundResponse({
    description:"no posts yet.",
    example:{
      message:"No  posts yet",
      code:"NOT_FOUND",
      statusCode:404
    }

  })
  @ApiInternalServerErrorResponse({
    description:"throw when server field to fetch posts data.",
    example:{
        message:"throw when server field to fetch posts data",code:"FIELD",statusCode:500}
  })
 async getAllPosts(){
  const posts=await this.adminService.transactions('post','findMany',{include:{author:{select:{fullName:true,username:true,email:true,profileImage:true}}}})
  return plainToInstance(PostsResponseDto,posts,{excludeExtraneousValues:true})
  // return await this.adminService.getPosts();
 }

//modify post to pe published or no published
  @Patch('update-post')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:"Modify post.",
    description:"modify post to be  published or not published."
  })
  @ApiCreatedResponse({
    description:"Success updated post.",
    example:{message:"success updated.",code:"SUCCESS",statusCode:201}
  })
  @ApiBadRequestResponse({
    description:"post published parameter value  validation error it not of boolean type.",
    example:{message:"Invalid Published input",code:"INVALID",statusCode:400}
  })
  @ApiBadRequestResponse({
    description:"post id parameter validation error.",
    example:{message:"Invalid id input",code:"INVALID",statusCode:400}
  })
  @ApiNotFoundResponse({ 
    description:"the  post id is un correct.",
    example:{
      message:"No  post exist",
      code:"NOT_FOUND",
      statusCode:404
    }})
  @ApiInternalServerErrorResponse({    
    description:"throw when server field to update post data.",
    example:{
        message:"throw when server field to update post data",code:"FIELD",statusCode:500
    }})
  @ApiQuery({
    name:"postId",
    description:"post id to update post published value. it must correct input value. ",
    type:"string",
  })
  @ApiQuery({
    name:"published",
    description:"input must boolean to detect if the post will be published or nor published.",
    type:"boolean",
  })
  async updatePost(@Query('postId',ParseCUUIDPipe) postId:string,@Query('published',ParseBoolPipe) isPublished:boolean){
    await this.adminService.checkExistData('post',postId)
    await this.adminService.transactions('post','update',{where:{id:postId},data:{published:isPublished}})
    // console.log(updated)
    return {message:"success updated.",code:"SUCCESS",statusCode:201}
    // return await this.adminService.modifyPost(postId,isPublished);
  }

 //delete post by id
@Delete('del-post/:postId')
 @HttpCode(HttpStatus.OK)
 @ApiOperation({
  summary:"Enter post id to delete it.",
  description:"this route provide to you to delete the post."
 })
@ApiParam({
    name:"postId",
    allowEmptyValue:false,
    description:"post id that you want to delete. it",
    example:"gshdhsdsf4sdshgdhsgds",
  })
 @ApiOkResponse({
  description:"Success delete your  post",
  example:{message:`success post 1 row deleted.`,code:"SUCCESS",statusCode:200}
 })
  @ApiBadRequestResponse({
    description:"post id parameter validation error.",
    example:{message:"Invalid id input",code:"INVALID",statusCode:400}
  })
   @ApiNotFoundResponse({
    description:"the  post id is un correct.",
    example:{
      message:"No  post exist",
      code:"NOT_FOUND",
      statusCode:404
    }

  })
  @ApiInternalServerErrorResponse({
    description:"throw when try to delete post data.",
    example:{
        message:"Failed to delete post.",
        code:"FAILED_SERVER",
        statusCode:500
        }
  })
 async deletePost(@Param('postId',ParseCUUIDPipe) postId:string){
  await this.adminService.checkExistData('post',postId)
  await this.adminService.transactions('post','delete',{where:{id:postId}})
  return {message:`success post 1 row deleted.`,code:"SUCCESS",statusCode:200}
  // console.log(postId)
  // return await this.adminService.deletePost(postId)
 }

 //delete all user posts by id
 @Delete('del-user-posts/:userId')
 @HttpCode(HttpStatus.OK)
 @ApiOperation({
  summary:"Enter user id to delete his posts.",
  description:"this route provide to you to delete all user posts."
 })
 @ApiParam({
    name:"userId",
    allowEmptyValue:false,
    description:"user id that you want to delete his posts",
    example:"gshdhsdsf4sdshgdhsgds",
  })
 @ApiOkResponse({
  description:"Success delete user posts",
  example:{message:`success post [number] row deleted.`,code:"SUCCESS",statusCode:200}
 })
 @ApiBadRequestResponse({
    description:"user id parameter validation error.",
    example:{message:"Invalid id input",code:"INVALID",statusCode:400}
  })
 @ApiNotFoundResponse({
    description:"the  user id is un correct.",
    example:{
    message:"User did not have posts yet.",code:"NOT_FOUND",statusCode:404}

  })
 @ApiInternalServerErrorResponse({ 
    description:"throw when try to delete user posts.",
    example:{
        message:"Failed to delete user posts.",
        code:"FAILED_SERVER",
        statusCode:500
        }
  })
 async deleteUserPosts(@Param('userId',ParseCUUIDPipe) userId:string){
  await this.adminService.checkExistData('user',userId)
  const deletedRows=await this.adminService.transactions('post','deleteMany',{where:{authorId:userId}})
  // console.log(postId)
  return {message:`success user posts ${deletedRows.count} row deleted.`,code:"SUCCESS",statusCode:200}
  // return await this.adminService.deleteAllUserPosts(userId)
 }

 //get all user posts by id
 @Get('user-posts/:userId')
 @HttpCode(HttpStatus.OK)
 @ApiOperation({
  summary:"Enter user id to fetch his posts.",
  description:"this route provide to you to fetch all user posts."
 })
 @ApiParam({
    name:"userId",
    allowEmptyValue:false,
    description:"user id that you want to fetch his posts",
    example:"gshdhsdsf4sdshgdhsgds",
  })
 @ApiOkResponse({
  description:"Success fetch user posts",
  example:{
  "role": "CUSTOMER",
  "profileImage": "1787097518102-830313047.jpg",
  "posts": [
    {
      "postId": "cmt3jz6o1000110db33ob8vfq",
      "userPost": "this is the best digital software development platform, they provide more useful software services",
      "published": true
    },
    {
      "postId": "cmt3jz6o1000010db33ob8vfq",
      "userPost": "this is the best digital software development platform, they provide more useful software services",
      "published": false
    }
  ],
  "userId": "cmscea6jb0000c4db3o2plabd",
  "userFullName": "ashraf abdul-fattah hazaea fazaea",
  "userName": "user12554",
  "email": "useremail@gmail.com"
}
 })
 @ApiBadRequestResponse({
    description:"user id parameter validation error.",
    example:{message:"Invalid id input",code:"INVALID",statusCode:400}
  })
 @ApiNotFoundResponse({
    description:"the  user id is un correct.",
    example:{
    message:"User did not have posts yet.",code:"NOT_FOUND",statusCode:404}

  })
 @ApiInternalServerErrorResponse({ 
    description:"throw when try to fetch user posts.",
    example:{
        message:"Failed to fetch user posts.",
        code:"FAILED_SERVER",
        statusCode:500
        }
  })
 async getUserPosts(@Param('userId',ParseCUUIDPipe) userId:string){
    // await this.adminService.checkExistData('user',userId)
  const userPosts=await this.adminService.transactions('user','findMany',{where:{id:userId},include:{posts:true}})
  // console.log(userPosts)
  return plainToInstance(UserPostsResponseDto,userPosts,{excludeExtraneousValues:true})
  // return await this.adminService.getAllUserPosts(userId)
 }

 //delete all posts
 @Delete('posts')
 @HttpCode(HttpStatus.OK)
 @ApiOperation({
  summary:"delete all posts.",
  description:"this route provide to you to delete all post."
 })
  @ApiOkResponse({
  description:"Success deleted all  posts",
  example:{message:"success [number] posts rows deleted.",code:"SUCCESS",statusCode:200}
 })
  @ApiNotFoundResponse({
    description:"no posts yet.",
    example:{
      message:"No  posts yet",
      code:"NOT_FOUND",
      statusCode:404
    }

  })
  @ApiInternalServerErrorResponse({
    description:"throw when server field to delete all posts.",
    example:{
        message:"throw when server field to delete all posts ",code:"FIELD",statusCode:500}
  })
 async deleteAllPosts(){
  const deletedRows = await this.adminService.transactions('post','deleteMany',{})
  return {message:`success ${deletedRows.count} posts rows deleted.`,code:"SUCCESS",statusCode:200}
  // return await this.adminService.deleteAllPosts();
 }
//====================================================end posts===========================


//===============================================Services=================================
//get all services
 @Get('services')
 @HttpCode(HttpStatus.OK)
 @ApiOperation({
  summary:"Fetch all services.",
  description:"this route provide to you to fetch all services."
 })
  @ApiOkResponse({
  description:"Success fetch all  services",
  example:[  {
    "serviceName": "Develop Mobile App",
    "description": "We developed mobile apps in professional way with design and plans",
    "serviceId":"jhjhgsdgshdsdksjdsss",
    "iconUrl":"54565456-46545.png"
  },  {
    "serviceName": "Develop Mobile App",
    "description": "We developed mobile apps in professional way with design and plans",
    "serviceId":"jhjhgsdgshdsdksjdsss",
    "iconUrl":"54565456-46545.png"
  }]
 })
  @ApiNotFoundResponse({
    description:"no services yet.",
    example:{
      message:"No  services yet",
      code:"NOT_FOUND",
      statusCode:404
    }

  })
  @ApiInternalServerErrorResponse({
    description:"throw when server field to fetch services data.",
    example:{
        message:"throw when server field to fetch services data",code:"FIELD",statusCode:500}
  })
 async getAllServices(){
  const services=await this.adminService.transactions('service','findMany',{})
  return plainToInstance(ServicesResponseDto,services,{excludeExtraneousValues:true})
 }
  // add new service 
  @Post('service')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({
    required:true,
    type:CreateServicesRequestDto
  })
  @ApiCreatedResponse({
    description:"Success save new service.",
    example:{message:"Success save new service.",code:"SUCCESS",statusCode:201}
  })
  @ApiBadRequestResponse({
    example:{message:"Request validation data.",code:"INVALID",statusCode:400}
  })
  @ApiInternalServerErrorResponse({
    description:"Failed receive new service data.",
    example:{message:"Failed receive new service data. try again.",code:"FAILED",statusCode:500}
  })
async newService(@Body() createService:CreateServicesRequestDto){
  await this.adminService.transactions('service','create',{data:{
    title:createService.serviceName,
    description:createService.description,
    icon:createService.iconUrl
  }});
 return {message:"Success save new service.",code:"SUCCESS",statusCode:201}
}

 //modify service 
  @Patch('service')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:"Modify service.",
    description:"modify service to new data or services we provides."
  })
  @ApiBody({
    description:" enter service data you want to update it . Note must the service id is valid and it no able to change.",
    type:ServicesRequestDto
  })
  @ApiCreatedResponse({
    description:"Success updated service.",
    example:{message:"success updated.",code:"SUCCESS",statusCode:201}
  })
  @ApiBadRequestResponse({
    description:"service id parameter validation error.",
    example:{message:"Invalid id input",code:"INVALID",statusCode:400}
  })
  @ApiNotFoundResponse({ 
    description:"the  service id is un correct.",
    example:{
      message:"No  service exist",
      code:"NOT_FOUND",
      statusCode:404
    }})
  @ApiInternalServerErrorResponse({    
    description:"throw when server field to update service data.",
    example:{
        message:"throw when server field to update service data",code:"FIELD",statusCode:500
    }})
  async updateService(@Body() updateServiceDto:ServicesRequestDto){
    await this.adminService.checkExistData('service',updateServiceDto.ServiceId);
    await this.adminService.transactions('service','update',{where:{id:updateServiceDto.ServiceId},
                                          data:{title:updateServiceDto.ServiceId,
                                            description:updateServiceDto.description,
                                            icon:updateServiceDto.iconUrl
                                          }});
    return {message:"success updated.",code:"SUCCESS",statusCode:201}
  }

 //delete service by id
@Delete('service/:serviceId')
 @HttpCode(HttpStatus.OK)
 @ApiOperation({
  summary:"Enter service id to delete it.",
  description:"this route provide to you to delete the service."
 })
@ApiParam({
    name:"serviceId",
    allowEmptyValue:false,
    description:"service id that you want to delete. it",
    example:"gshdhsdsf4sdshgdhsgds",
  })
 @ApiOkResponse({
  description:"Success delete your  service",
  example:{message:`success service 1 row deleted.`,code:"SUCCESS",statusCode:200}
 })
  @ApiBadRequestResponse({
    description:"service id parameter validation error.",
    example:{message:"Invalid id input",code:"INVALID",statusCode:400}
  })
   @ApiNotFoundResponse({
    description:"the  service id is un correct.",
    example:{
      message:"No  service exist",
      code:"NOT_FOUND",
      statusCode:404
    }

  })
  @ApiInternalServerErrorResponse({
    description:"throw when try to delete service data.",
    example:{
        message:"Failed to delete service.",
        code:"FAILED_SERVER",
        statusCode:500
        }
  })
 async deleteService(@Param('serviceId',ParseCUUIDPipe) serviceId:string){
  await this.adminService.checkExistData('service',serviceId)
  await this.adminService.transactions('service','delete',{where:{id:serviceId}})
  return {message:`success service 1 row deleted.`,code:"SUCCESS",statusCode:200}

 }

 //delete all services
 @Delete('services')
 @HttpCode(HttpStatus.OK)
 @ApiOperation({
  summary:"delete all services.",
  description:"this route provide to you to delete all services."
 })
  @ApiOkResponse({
  description:"Success deleted all  services",
  example:{message:"success [number] services rows deleted.",code:"SUCCESS",statusCode:200}
 })
  @ApiNotFoundResponse({
    description:"no services yet.",
    example:{
      message:"No  services yet",
      code:"NOT_FOUND",
      statusCode:404
    }

  })
  @ApiInternalServerErrorResponse({
    description:"throw when server field to delete all services.",
    example:{
        message:"throw when server field to delete all services ",code:"FIELD",statusCode:500}
  })
 async deleteAllServices(){
  const deletedRows = await this.adminService.transactions('service','deleteMany',{})
  return {message:`success ${deletedRows.count} services rows deleted.`,code:"SUCCESS",statusCode:200}
 }
 //===========================================end service========================================

 

//===============================================technology=================================
//get all technology
 @Get('technologies')
 @HttpCode(HttpStatus.OK)
 @ApiOperation({
  summary:"Fetch all technologies.",
  description:"this route provide to you to fetch all technologies."
 })
  @ApiOkResponse({
  description:"Success fetch all  technologies",
  example:[  {
    "TechId":"hjhds46s454ssd",
    "technologyName": "Nodejs",
    "logo":"454s4d5s4d54s.png"
  },  {
    "TechId":"hjhds46s454ssd",
    "technologyName": "Flutter",
    "logo":"454s4d5s4d54s.png"
  }]
 })
  @ApiNotFoundResponse({
    description:"no technologies yet.",
    example:{
      message:"No  technologies yet",
      code:"NOT_FOUND",
      statusCode:404
    }

  })
  @ApiInternalServerErrorResponse({
    description:"throw when server field to fetch technologies data.",
    example:{
        message:"throw when server field to fetch technologies data",code:"FIELD",statusCode:500}
  })
 async getAllTechnologies(){
  const technologies=await this.adminService.transactions('technology','findMany',{})
  return plainToInstance(TechnologyResponseDto,technologies,{excludeExtraneousValues:true})
 }


  // add new technology 
  @Post('technology')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({
    required:true,
    type:CreateTechnologyRequestDto
  })
  @ApiCreatedResponse({
    description:"Success save new technology.",
    example:{message:"Success save new technology.",code:"SUCCESS",statusCode:201}
  })
  @ApiBadRequestResponse({
    example:{message:"Request validation data.",code:"INVALID",statusCode:400}
  })
  @ApiInternalServerErrorResponse({
    description:"Failed receive new technology data.",
    example:{message:"Failed receive new technology data. try again.",code:"FAILED",statusCode:500}
  })
async newTechnology(@Body() createTechnology:CreateTechnologyRequestDto){
  await this.adminService.transactions('technology','create',{data:{
    name:createTechnology.technologyName,
    logo:createTechnology.logo
  }});
 return {message:"Success save new technology.",code:"SUCCESS",statusCode:201}
}

 //modify technology 
  @Patch('technology')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:"Modify technology.",
    description:"modify technology to new data or technologies we provides."
  })
  @ApiBody({
    description:" enter technology data you want to update it . Note must the technology id is valid and it no able to change.",
    type:TechnologyRequestDto
  })
  @ApiCreatedResponse({
    description:"Success updated technology.",
    example:{message:"success updated.",code:"SUCCESS",statusCode:201}
  })
  @ApiBadRequestResponse({
    description:"technology id parameter validation error.",
    example:{message:"Invalid id input",code:"INVALID",statusCode:400}
  })
  @ApiNotFoundResponse({ 
    description:"the  technology id is un correct.",
    example:{
      message:"No  technology exist",
      code:"NOT_FOUND",
      statusCode:404
    }})
  @ApiInternalServerErrorResponse({    
    description:"throw when server field to update technology data.",
    example:{
        message:"throw when server field to update technology data",code:"FIELD",statusCode:500
    }})
  async updateTechnology(@Body() updateTechnologyDto:TechnologyRequestDto){
    await this.adminService.checkExistData('technology',updateTechnologyDto.TechId);
    await this.adminService.transactions('technology','update',{where:{id:updateTechnologyDto.TechId},
                                          data:{name:updateTechnologyDto.technologyName,
                                            logo:updateTechnologyDto.logo
                                          }});
    return {message:"success updated.",code:"SUCCESS",statusCode:201}
  }

 //delete technology by id
@Delete('technology/:technologyId')
 @HttpCode(HttpStatus.OK)
 @ApiOperation({
  summary:"Enter technology id to delete it.",
  description:"this route provide to you to delete the technology."
 })
@ApiParam({
    name:"technologyId",
    allowEmptyValue:false,
    description:"technology id that you want to delete. it",
    example:"gshdhsdsf4sdshgdhsgds",
  })
 @ApiOkResponse({
  description:"Success delete your  technology",
  example:{message:`success technology 1 row deleted.`,code:"SUCCESS",statusCode:200}
 })
  @ApiBadRequestResponse({
    description:"technology id parameter validation error.",
    example:{message:"Invalid id input",code:"INVALID",statusCode:400}
  })
   @ApiNotFoundResponse({
    description:"the  technology id is un correct.",
    example:{
      message:"No  technology exist",
      code:"NOT_FOUND",
      statusCode:404
    }

  })
  @ApiInternalServerErrorResponse({
    description:"throw when try to delete technology data.",
    example:{
        message:"Failed to delete technology.",
        code:"FAILED_SERVER",
        statusCode:500
        }
  })
 async deleteTechnology(@Param('technologyId',ParseCUUIDPipe) technologyId:string){
  await this.adminService.checkExistData('technology',technologyId)
  await this.adminService.transactions('technology','delete',{where:{id:technologyId}})
  return {message:`success technology 1 row deleted.`,code:"SUCCESS",statusCode:200}

 }

 //delete all technologies
 @Delete('technologies')
 @HttpCode(HttpStatus.OK)
 @ApiOperation({
  summary:"delete all technologies.",
  description:"this route provide to you to delete all technologies."
 })
  @ApiOkResponse({
  description:"Success deleted all  technologies",
  example:{message:"success [number] technology rows deleted.",code:"SUCCESS",statusCode:200}
 })
  @ApiNotFoundResponse({
    description:"no technologies yet.",
    example:{
      message:"No  technologies yet",
      code:"NOT_FOUND",
      statusCode:404
    }

  })
  @ApiInternalServerErrorResponse({
    description:"throw when server field to delete all technologies.",
    example:{
        message:"throw when server field to delete all technologies ",code:"FIELD",statusCode:500}
  })
 async deleteAllTechnologies(){
  const deletedRows = await this.adminService.transactions('technology','deleteMany',{})
  return {message:`success ${deletedRows.count} technologies rows deleted.`,code:"SUCCESS",statusCode:200}
 }
 //==============================================end technology=============================
//                                                contact messages
//get all customer messages
@Get('messages')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary:"Fetch all customers messages.",
  description:"this route provide to you to fetch all customers messages."
 })
@ApiOkResponse({
  description:"Success fetch all  customers messages",
  example:[  {
    "ContactId":"hjhds46s454ssd",
    "userFullName":"ashraf abdulfattah hazaea",
    "email":"useremail@gmail.com",
    "subject": "build mobile app",
    "phoneNumber":"+967714502632",
    "message":"jhjsghsghv sjhds dsjbskbj dskjdhskjd "
  },  {
    "ContactId":"hjhdsuh46s454ssd",
    "userFullName":"Ali mohammed ali",
    "email":"useremail@gmail.com",
    "subject": "build web site",
    "phoneNumber":"+967713502632",
    "message":"jhjsghshs sjhss  shd sjkh ksjh dkj ghv sjhds dsjbskbj dskjdhskjd "
  }]
 })
@ApiNotFoundResponse({
    description:"no messages yet.",
    example:{
      message:"No  messages yet",
      code:"NOT_FOUND",
      statusCode:404
    }

  })
@ApiInternalServerErrorResponse({
    description:"throw when server field to fetch customers messages.",
    example:{
        message:"throw when server field to fetch messages data",code:"FIELD",statusCode:500}
  })
async getMessages(){
  const messages = await this.adminService.transactions('contactMassage','findMany',{});
  return plainToInstance(ContactMassageResponseDto,messages,{excludeExtraneousValues:true})
}


//delete all customer messages
@Delete('messages')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary:"delete all customers messages.",
  description:"this route provide to you to delete all customers messages."
 })
@ApiOkResponse({
  description:"Success delete all  customers messages",
  example:{message:"success [number] messages rows deleted.",code:"SUCCESS",statusCode:200}
 })
@ApiNotFoundResponse({
    description:"no messages yet.",
    example:{
      message:"No  messages yet",
      code:"NOT_FOUND",
      statusCode:404
    }

  })
@ApiInternalServerErrorResponse({
    description:"throw when server field to delete customers messages.",
    example:{
        message:"throw when server field to delete messages data",code:"FIELD",statusCode:500}
  })
async deleteMessages(){
  const messages = await this.adminService.transactions('contactMassage','deleteMany',{});
  return {message:`success ${messages.count} messages rows deleted.`,code:"SUCCESS",statusCode:200}
}

//delete  customer message by id
@Delete('messages/:messageId')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary:"delete one customer message.",
  description:"this route provide to you to delete  customers messages by id."
 })
@ApiOkResponse({
  description:"Success delete  customer message",
  example:{message:"success 1 message rows deleted.",code:"SUCCESS",statusCode:200}
 })
 @ApiBadRequestResponse({
  description:"invalid message id.",
  example:{
    message:"message id is invalid ",code:"INVALID",statusCode:400
  }
 })
@ApiNotFoundResponse({
    description:"no message yet.",
    example:{
      message:"No  message yet",
      code:"NOT_FOUND",
      statusCode:404
    }
  })
@ApiInternalServerErrorResponse({
    description:"throw when server field to delete customer message.",
    example:{
        message:"throw when server field to delete message data",code:"FIELD",statusCode:500}
  })
  @ApiParam({
    name:"messageId",
    description:"Delete message by its id, enter the correct messageId",
    allowEmptyValue:false,
    required:true
  })
async deleteMessage(@Param('messageId',ParseCUUIDPipe) messageId:string){
   await this.adminService.checkExistData('contactMassage',messageId)
   await this.adminService.transactions('contactMassage','delete',{where:{id:messageId}});
  return {message:`success 1 message rows deleted.`,code:"SUCCESS",statusCode:200}
}
//==============================================end messages=================
                                        // settings
//get settings
@Get('setting')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary:"Fetch setting.",
  description:"this route provide to you to fetch setting."
 })
@ApiOkResponse({
  description:"Success fetch setting.",
  example:{
    "companyName":"DigitalGateway",
    "logo":"https://hgdhs.png",
    "email":"digitalGateway@digital.com",
    "phoneNumber":"+967714523601",
    "companyAddress":"Yemen Taze , Jamal street",
    "facebook":"https://sgdhgsfhgdfshfdhsfgdsds",
    "whatsapp":"https://sgdhgsfhgdfshfdhsfgdsdsjshdjshdjhsk",
    "instagram":"https://sgdhgsfhgdfshfdhsfgdsdsjshdjshdjhskjskhdjhs"
  }
 })
@ApiNotFoundResponse({
    description:"no setting yet.",
    example:{
      message:"No  setting yet",
      code:"NOT_FOUND",
      statusCode:404
    }

  })
@ApiInternalServerErrorResponse({
    description:"throw when server field to fetch setting",
    example:{
        message:"throw when server field to fetch setting data",code:"FIELD",statusCode:500}
  })
async getSetting(){
  const setting = await this.adminService.transactions('settings','findFirst',{});
  return plainToInstance(SettingsResponseDto,setting,{excludeExtraneousValues:true})
}

//update setting
@Patch('setting')
@HttpCode(HttpStatus.CREATED)
@ApiOperation({
  summary:"update setting.",
  description:"this route provide to you to update setting."
 })
@ApiBody({
  description:"update platform setting data",
  type:CreateSettingsRequestDto
})
@ApiOkResponse({
  description:"Success update setting.",
  example:{ message:"success updated setting data.",code:"SUCCESS",statusCode:201}
 })
@ApiBadRequestResponse({
    description:"invalid setting input data ",
    example:{
      message:"invalid setting input data ",
      code:"BAD_DATA",
      statusCode:404
    }

  })
@ApiInternalServerErrorResponse({
    description:"throw when server field to update setting",
    example:{message:"throw when server field to update setting data",code:"FIELD",statusCode:500}
  })
async updateSetting(@Body() updateSetting:CreateSettingsRequestDto){
  await this.adminService.transactions('settings','updateMany',{data:{
            address:updateSetting.companyAddress,
            companyName:updateSetting.companyName,
            email:updateSetting.email,
            facebook:updateSetting.facebook,
            instagram:updateSetting.instagram,
            logo:updateSetting.logo,
            phone:updateSetting.phoneNumber,
            whatsapp:updateSetting.whatsapp
  }}, new InternalServerErrorException({message:"throw when server field to update setting data",code:"FIELD",statusCode:500}))
  return { message:"success updated setting data.",code:"SUCCESS",statusCode:201}
}


}