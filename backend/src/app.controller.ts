import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, InternalServerErrorException, NotFoundException, Param, Post, Put, Req, Res, UploadedFile, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { join } from 'path';
import * as express from 'express'
import { JwtGuard } from './modules/auth/Guards/jwt.auth.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiForbiddenResponse, ApiHeader, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
// import { CustomerResponse } from './modules/auth/dto/user-response.dto';
import { ImageDto } from './common/image.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileUpdateDto } from './dto/upload-file.dto';
import { UploadFilesExceptionFilter } from './exceptionFilter/upload.exception.filter';
import { Roles } from './modules/auth/decorators/user-roles.decorator';
import { UserRole } from './common/enum';
import { CreateContactMassageRequestDto, PostRequestDto, ProjectResponseDto, ServicesResponseDto, SettingsResponseDto, TechnologyResponseDto } from './dto/requests-response-validation.dto';
import { multerConfig } from './common/Multer.config';
import { ParseImageNamePipe } from './pipe/parseImagesNamePipe';
import { plainToInstance } from 'class-transformer';
import { ParseCUUIDPipe } from './pipe/parescuuidpipe';


@ApiTags("User")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }


//==============================================================user route handler=============================
//send the user's data to client
  @Get("user/profile")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:"User profile", description:"Get user profile data"})
  @ApiBearerAuth("access-token")
  @ApiOkResponse({
    description:"Valid access-token, get user profile data",
    example:{userFullName:"ashraf sghdsjg skjhsd",userName:"ash@6ggs",email:"username@gmail.com",profileImage:"465465465-545545.png"}
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token in the format: Bearer <your-token>',
    required: true,
    example: 'Bearer eyJhbGciOiJIUzI1NiIs...',
  })
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

  @UseGuards(JwtGuard)
  async user(@Req() req:any){
      // console.log(req.user)
      const profileData = await this.appService.getProfile(req.user.id)
      // console.log(profileData)
    return profileData
  }


  
  //send user profile image to client
  // @Roles()
  @Get('user/profile/:name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:"User profile image", description:"Get user profile image "})
  @ApiBearerAuth("access-token")
  @ApiOkResponse({
    description:"send user profile image",
    type: ImageDto
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token in the format: Bearer <your-token>',
    required: true,
    example: 'Bearer eyJhbGciOiJIUzI1NiIs...',
  })
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
@UseGuards(JwtGuard)
 async getProfile(@Param('name',ParseImageNamePipe) profile_url:string,@Res() res:express.Response) {
        await this.appService.transactions('user','findFirst',{where:{profileImage:profile_url}})

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


 //update user profile 
     @Post('user/profile')
     @ApiOperation({
         summary:"Update user profile.",
         description:"Update user profile image and fullName and username."
     })
     @ApiOkResponse({
      description:"success update your profile.",
      example:{message:"success update your profile.",
        data:{
          image:"546546546-66546464.[png,jpg,..]",
          username:"ashraf",
          fullName:"ashraf abdul-fattah hazaea fazaea"
        }
        ,code:"SUCCESS",statusCode:200}
     })
     @ApiConsumes('multipart/form-data')
     @ApiBody({
         description: 'Select a image to upload. Max size: 3MB. Allowed: PNG, JPEG, JPG. and fill fullName and username fields.',
         type: ProfileUpdateDto,
     })
     @ApiBadRequestResponse({
         description:"Invalid uploaded file type. file type must one of PNG, JPEG, ore JPG.",
         example:{
                     message:'Invalid file type',
                     code:"INVALID_FILE",
                     statusCode:400
                 }
     })
     @ApiNotFoundResponse({
         description:"Invalid uploaded file. file not uploaded.",
         example:{
                     message:'File not found',
                     code:"FILE_NOT_FOUND",
                     statusCode:404
                 }
     })
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
     @ApiInternalServerErrorResponse({
         description:"Failed update your profile. try again.",
         example:{message:"Failed update your profile.",code:"FAILED",statusCode:500}
     })
     @ApiBadRequestResponse({
         description:"Failed update your profile. try again. check required fields.",
         example:{message:"Failed update your profile.",code:"FAILED",statusCode:400}
     })
     @HttpCode(HttpStatus.OK)
     @ApiBearerAuth('access-token')
     @UseInterceptors(FileInterceptor('profiles',multerConfig(3,3,'profiles')))
     @UseGuards(JwtGuard)
     async updateProfile(@UploadedFile() file :Express.Multer.File,@Body() body:any, @Req() req:express.Request){
      if(!file)
        throw new NotFoundException({
                     message:'File not found',
                     code:"FILE_NOT_FOUND",
                     statusCode:404
                 })
        // console.log(body)
        const isUpdated= await this.appService.updateProfile(file.filename,body,req.user!['id'])
        if(!isUpdated)
          throw new InternalServerErrorException(
        {message:"Failed update your profile.",code:"FAILED",statusCode:500})
        req['filePath']=undefined
        return {message:"success update your profile.",
        data:isUpdated,
        code:"SUCCESS",statusCode:200}
        
     }


  // user add post 
  @Post('user/new-post')
  @ApiBody({
    required:true,
    type:PostRequestDto
  })
  @ApiCreatedResponse({
    description:"Success save your post.",
    example:{message:"Success save your post.",code:"SUCCESS",statusCode:201}
  })
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
  @ApiBadRequestResponse({
    example:{message:"Post should contain arabic or english or numbers characters",code:"BAD_POST",statusCode:400}
  })
  @ApiInternalServerErrorResponse({
    description:"Failed receive your post.",
    example:{message:"Failed receive your post. try again.",code:"FAILED",statusCode:500}
  })
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard)
  async newUserPost(@Body() post:PostRequestDto,@Req() req:express.Request){
    const user:any = req.user
    // console.log(post.userPost.match(/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z0-9 ,.]+$/))

    return await this.appService.newUserPosted(post.userPost,user.id)
  }

  //user see posts on platform 
  @Get('platform/users-posts')
  @ApiOperation({
    summary:"Get users posts",
    description:"Get users opinion posts about DigitalGateway platform."
  })
  @ApiOkResponse({
    description:"Return list of posts object",
    example:[  {
    "user": {
      "userFullName": "ashraf abdul-fattah hazaea fazaea",
      "userName": "ashraf235",
      "profileImage": "1787097518102-830313047.jpg"
    },
    "userPost": "this is the best digital software development platform, they provide more useful software services"
  },  {
    "user": {
      "userFullName": "gopran abdul-fattah hazaea fazaea",
      "userName": "gobran45",
      "profileImage": "1787097518102-830313747.jpg"
    },
    "userPost": "this is the best digital software development platform, they provide more useful software services"
  }]
  })
  @ApiNotFoundResponse({
    description:"throw when No posts yet.",
    example:{message:"No posts yet.",code:"NO_POSTS",statusCode:404}
  })
  @ApiInternalServerErrorResponse({
    description:"Server Failed fetch posts.",
    example:{message:"Failed fetched posts. try again.",code:"FAILED",statusCode:500}
  })
  @HttpCode(HttpStatus.OK)
  async getUsersPlatformPosts(){
    return await this.appService.getUsersPosts();
  }

  //user see our projects
  @Get('platform/projects')
  @ApiOperation({summary:"Get Projects to users"})
  @ApiOkResponse({
    description:"Return list of projects object",
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
      imageUrl:"5454dsjh6564-54.png"
      },
            {
      imageUrl:"5454dsjh6564-54.png"
      },
      {
      imageUrl:"5454dsjh6564-54.png"
      }
    ]
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
      imageUrl:"5454dsjh6564-54.png"
      },
            {
      imageUrl:"5454dsjh6564-54.png"
      },
            {
      imageUrl:"5454dsjh6564-54.png"
      }
    ]
    },

  ]
  })
  @ApiNotFoundResponse({
    description:"throw when No projects yet.",
    example:{message:"No projects yet.",code:"NO_PROJECTS",statusCode:404}
  })
  @ApiInternalServerErrorResponse({
    description:"Server Failed fetch projects.",
    example:{message:"Failed fetched projects. try again.",code:"FAILED",statusCode:500}
  })
  @HttpCode(HttpStatus.OK)
  async getProjects(){
    return await this.appService.getProjects();
  }

   //user see one of our project
  @Get('platform/project/:projectId')
  @ApiOperation({summary:"Get Project by id"})
  @ApiOkResponse({
    description:"Return  project by id",
    example:
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
      imageUrl:"5454dsjh6564-54.png"
      },
            {
      imageUrl:"5454dsjh6564-54.png"
      },
      {
      imageUrl:"5454dsjh6564-54.png"
      }
    ]
    }
  
  })
  @ApiNotFoundResponse({
    description:"throw when No project yet.",
    example:{message:"No project yet.",code:"NOT_FOUND",statusCode:404}
  })
  @ApiInternalServerErrorResponse({
    description:"Server Failed fetch project.",
    example:{message:"Failed fetched project. try again.",code:"FAILED",statusCode:500}
  })
  @ApiParam({
    name:"projectId",
    required:true,
    description:"Get project by id",
    allowEmptyValue:false
  })
  @HttpCode(HttpStatus.OK)
  async getProject(@Param('projectId',ParseCUUIDPipe) projectId:string){
    await this.appService.checkExistData('project',projectId);
    const project = await this.appService.transactions('project','findUnique',{where:{id:projectId},select:{
        id:true,
        title:true,
        category:true,
        shortDescription:true,
        description:true,
        slug:true,
        projectUrl:true,
        images:{select:{imageUrl:true}},
    }});

    return plainToInstance(ProjectResponseDto,project,{excludeExtraneousValues:true})
  }
  

  //user create new contact message 
  @Post('message')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:"send customer messages.",
    description:"this route provide to user to send his messages."
   })
   @ApiBody({
    description:"Enter your message to contact with us, and to tell us how we help you",
    type:CreateContactMassageRequestDto
   })
  @ApiOkResponse({
    description:"Success send user message",
    example:{message:"success send message, we well replay on you later.",code:"SUCCESS",statusCode:201}
   })
  @ApiBadRequestResponse({
      description:"check requirements and correct data format before send.",
      example:{
        message:"invalid message input",
        code:"BAD_MESSAGE",
        statusCode:404
      }
  
    })
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
  @ApiInternalServerErrorResponse({
      description:"throw when server field to process customer message.",
      example:{message:"throw when server field to process message",code:"FIELD",statusCode:500}
    })
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN,UserRole.CUSTOMER)
  @UseGuards(JwtGuard)
  async sendMessage(@Body() createMessageDto:CreateContactMassageRequestDto,@Req() req:express.Request){
    const user:any=req.user
    await this.appService.transactions('contactMassage','create',{
      data:{
        name:user.fullname,
        email:user.email,
        phone:createMessageDto.phoneNumber,
        subject:createMessageDto.subject,
        message:createMessageDto.message,
        createdAt: new Date()}
    }, new InternalServerErrorException({message:"throw when server field to process message",code:"FIELD",statusCode:500}));
    return {message:"success send message, we well replay on you later.",code:"SUCCESS",statusCode:201}
  }

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
  const technologies=await this.appService.transactions('technology','findMany',{})
  if(technologies.length ===0)
    throw new NotFoundException({
      message:"No  technologies yet",
      code:"NOT_FOUND",
      statusCode:404
    })
  return plainToInstance(TechnologyResponseDto,technologies,{excludeExtraneousValues:true})
 }

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
   const services=await this.appService.transactions('service','findMany',{})
   if(services.length===0)
    throw new NotFoundException({
       message:"No  services yet",
       code:"NOT_FOUND",
       statusCode:404
     })
   return plainToInstance(ServicesResponseDto,services,{excludeExtraneousValues:true})
  }

  // const pa = join(process.cwd(),'','images/profiles')
  // return "<img src='http://localhost:3000/upload/profile'/>";

  //send project images to user
  @Get('project/images/:name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:"project image", description:"Get project image "})
  @ApiOkResponse({
    description:"send project  image",
    type: ImageDto
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
    await this.appService.transactions('gallery','findFirst',{where:{imageUrl:image_url}})
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

//============================================setting
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
  const setting = await this.appService.transactions('settings','findFirst',{});
  return plainToInstance(SettingsResponseDto,setting,{excludeExtraneousValues:true})
}


}
