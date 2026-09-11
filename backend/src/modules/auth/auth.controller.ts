import { CreateUserDto, VerifyCodeDto } from './dto/create-user.dto';
import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Req, Res} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiBadRequestResponse, ApiBody, ApiUnauthorizedResponse, ApiOkResponse, ApiConflictResponse, ApiNotFoundResponse, ApiRequestTimeoutResponse, ApiInternalServerErrorResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUser } from './dto/login.dto';
import { AccessTokenResponse, TokenResponse } from './dto/user-response.dto';
import { JwtGuard } from './Guards/jwt.auth.guard';
import express from 'express';
import { Cookie } from './decorators/cookie.decorator';
import { GoogleAuthGuard } from './Guards/google.auth.guard';
import { MailService } from '../mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, 
              // private readonly prismaService:PrismaService,
              private readonly mailService: MailService) {}


  //register user
@Post('register')
@HttpCode(HttpStatus.OK) // 201 Created
@ApiOperation({ 
  summary: 'Register a new user', 
  description: 'Creates a new user account and verify of user email by redirect he to email-verify endpoint.' 
})
@ApiBody({
  type: CreateUserDto, 
  description: 'User registration payload' 
})
@ApiOkResponse({
  description: 'Send to you code to verify your email, please check your email.',
  example:{email:"useremail@gmail.com"},
})
@ApiConflictResponse({
  description: 'Invalid input data (e.g., email already exists, validation fails).',
})
  async register(@Body() dto: CreateUserDto): Promise<any> {
    dto.lastLoginAt=new Date()
    await this.authService.checkUserExist(dto.email,dto.userName)
    const verifyEmail = await this.mailService.sendEmil(dto)

    return {verifyEmail:verifyEmail}
    // const tokens = await this.authService.register(dto);
    // res.cookie("refresh-token",tokens.refreshToken,{
    //   secure:false,
    //   signed:true,
    //   httpOnly:true,
    //   path:"/auth/refresh/",
    //   maxAge:1000*60*60*24*7,
    //   domain:process.env.COOKIE_DOMAIN
    //   // sameSite:"strict"
    // });
    // return {"accessToken":tokens.accessToken};
  }

//email verify
@Post('email-verify')
@HttpCode(HttpStatus.CREATED) // 201 Created
@ApiOperation({ 
  summary: 'Check of valid user email', 
  description: 'Verify user email by check the sended code to his email.' 
})
@ApiBody({
  type: VerifyCodeDto, 
  description: 'Verify code and user email' 
})
@ApiCreatedResponse({
  description: 'User successfully registered.',
  example:{accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtc2NlYTZqYTAwMDBjNGRiM28ycGxhYWQiLCJ1c2VybmFtZSI6ImFzaHJhZjIzNSIsImVtYWlsIjoiYXNocmFmQGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc4NTk2ODAyNywiZXhwIjoxNzg1OTY4MDMyfQ.fQBGgd4hs7Tu6R0_G1u6V9w1M_neRTEZAdDB_maAoxw"}
  // type:AccessTokenResponse, // Swagger will show this exact structure as the response
})
@ApiUnauthorizedResponse({
    description:"You tried to register more so you can not register now.",
    example:{
                message:`You tried to register more so you can not register now`,
                code: "INVALID_ATTEMPT_NUMBER",
                statusCode:401
            }
})
@ApiUnauthorizedResponse({
    description:"Protect user from try attack verify code.",
    example:{
                message:`User tried more than 3 times`,
                code: "INVALID_ATTEMPT_NUMBER",
                statusCode:401
            }
})

@ApiNotFoundResponse({
  description:"user try sent code verify before enter his email and receive code ",
  example:{message:"Register user before verify email",
                code: "NON_EXIST_USER",
                statusCode:404}
})

@ApiRequestTimeoutResponse({
  description:"Time to enter verify code is expired",
  example:{
                message:"Time to enter verify code is expired. Try register again to get new verify code.",
                code: "CODE_EXPIRED",
                statusCode:408
            }
})
@ApiBadRequestResponse({
    description: 'Entered verify code is wrong.',
    example:{
                message:`Entered verify code is wrong. try new verify code send to your email.`,
                code: "INVALID_CODE",
                statusCode:400
            }
})
  async verifyEmail(@Body() dto: VerifyCodeDto,@Res({passthrough:true}) res:express.Response): Promise<any> {
    // Call the service to create the user
    // dto.lastLoginAt=new Date()
    // console.log(dto)
    const user = await this.mailService.isVerify(dto.code,dto.email)
    const tokens = await this.authService.register(user.user);

    res.cookie("refresh-token",tokens.refreshToken,{
      secure:false,
      signed:true,
      httpOnly:true,
      path:"/auth/refresh/",
      maxAge:1000*60*60*24*7,
      // domain:process.env.COOKIE_DOMAIN
      // sameSite:"strict"
    });
    return {"accessToken":tokens.accessToken};
  }



  //login user
  @Post("login")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:"User login",
    description:"User login to platform"
  })
  @ApiBody({
    type:LoginUser,
    description:"User login payload"
  })
  @ApiCreatedResponse({
    description:"Success login to platform redirected to home page",
    example:{accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtc2NlYTZqYTAwMDBjNGRiM28ycGxhYWQiLCJ1c2VybmFtZSI6ImFzaHJhZjIzNSIsImVtYWlsIjoiYXNocmFmQGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc4NTk2ODAyNywiZXhwIjoxNzg1OTY4MDMyfQ.fQBGgd4hs7Tu6R0_G1u6V9w1M_neRTEZAdDB_maAoxw"}
  })
  @ApiUnauthorizedResponse({
    description:"Unauthorized credentials ,check the entry data and try again",
    example:{
                message:`User input invalid credentials`,
                code: "INVALID_CREDENTIALS",
                statusCode:401
            }
  })
  async loginManual(@Body() userDto:LoginUser, @Res({passthrough:true}) res:express.Response):Promise<any>{
    userDto.lastLoginAt = new Date()
    const logged = await this.authService.login(userDto)
    // response.cookie("access-token",logged['access-token'])
    // response.cookie("username",logged.username)
    // response.cookie("email",logged.email)
      res.cookie("refresh-token",logged.refreshToken,
        {
      secure:false,
      signed:true,
      httpOnly:true,
      path:"/auth/refresh/",
      maxAge:1000*60*60*24*7,
      // domain:"http://127.0.0.1:3000/"
      // sameSite:"strict"

    }
    );
    // console.log(req.cookies['refresh-token'])
    return {accessToken:logged.accessToken}
  }


//refresh expired token
@Post('refresh')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary:"Refresh Tokens",
  description:"Refresh expired access-token."
})
// @ApiBearerAuth("refresh-token")
@ApiOkResponse({
  description:"generate new access-token, refresh-token in cookie",
  example:{"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtc2NlYTZqYTAwMDBjNGRiM28ycGxhYWQiLCJ1c2VybmFtZSI6ImFzaHJhZjIzNSIsImVtYWlsIjoiYXNocmFmQGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc4NTk2ODAyNywiZXhwIjoxNzg1OTY4MDMyfQ.fQBGgd4hs7Tu6R0_G1u6V9w1M_neRTEZAdDB_maAoxw"}
})
// @ApiHeader({
//   name: 'Authorization',
//   description: 'JWT refresh-token in the format: Bearer <your-token>',
//   required: true,
//   example: 'Bearer eyJhbGciOiJIUzI1NiIs...',
// })
@ApiUnauthorizedResponse({
  description:"JWT missing cookie refresh-token, or expired. if expired should login again.",
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
    }    
})
async refreshToken(@Cookie('refresh-token') cookie:any,@Res({passthrough:true}) res:express.Response):Promise<any>{
      // console.log(cookie)
      // const refreshToken= header['authorization'];
      const tokens = await this.authService.refreshToken(cookie)
      // console.log(tokens)
      res.cookie("refresh-token",tokens.refreshToken,{
      secure:false,
      signed:true,
      httpOnly:true,
      path:"/auth/refresh/",
      maxAge:1000*60*60*24*7,
      // domain:process.env.COOKIE_DOMAIN
      // sameSite:"strict"
    });
      return {accessToken:tokens.accessToken}
}

//google login
@Get('google-login')
@ApiOperation({
    summary:"Google Authentication",
  description:"User confirms his credentials by login by google."
})
@UseGuards(GoogleAuthGuard)
async googleAuthenticationLogin(){}


@Get('google-redirect')
@HttpCode(HttpStatus.CREATED)
@ApiOperation({
  summary:"Google Authentication Redirected",
  description:"User register or login by google provider"
})
@ApiCreatedResponse({
  description:"Success operation",
  example:{"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtc2NlYTZqYTAwMDBjNGRiM28ycGxhYWQiLCJ1c2VybmFtZSI6ImFzaHJhZjIzNSIsImVtYWlsIjoiYXNocmFmQGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc4NTk2ODAyNywiZXhwIjoxNzg1OTY4MDMyfQ.fQBGgd4hs7Tu6R0_G1u6V9w1M_neRTEZAdDB_maAoxw"}
})
@ApiInternalServerErrorResponse({
  description:"Invalid server, tray again"
})
@UseGuards(GoogleAuthGuard)
async googleCallBack(@Req() req,@Res({passthrough:true}) res:express.Response):Promise<AccessTokenResponse>{

  const tokens:TokenResponse= await this.authService.googleLogin(req.user)
      res.cookie("refresh-token",tokens.refreshToken,{
      secure:false,
      signed:true,
      httpOnly:true,
      path:"/auth/refresh/",
      maxAge:1000*60*60*24*7,
      // domain:process.env.COOKIE_DOMAIN
      // sameSite:"strict"
    });
  return {accessToken:tokens.accessToken}
}


// reset password
@Post('reset-password')
@HttpCode(HttpStatus.OK)
@ApiOperation({
    summary:"Reset user password.",
    description:"Reset user password."
})
@ApiOkResponse({
description:"success set your new password.",
example:{message:"Success set your password.",code:"SUCCESS",statusCode:200}
})
@ApiBody({
    description: 'You must enter your old passwd to verify you for more security. after that enter new passwd and confirm new passwd.Note: must strong passwd.',
    type: ResetPasswordDto,
})
@ApiBadRequestResponse({
    description:"Enter strong password",
    example:{
                message:'Your password is weak please enter strong password',
                code:"WEAK_PASSWD",
                statusCode:400
            }
})
@ApiNotFoundResponse({
    description:"You do not have password, go to create password no reset password.",
    example:{
            message:'You do not have password, go to create password no reset password.',
            code:"NOT_FOUND",
            statusCode:404
        }
})
@ApiUnauthorizedResponse({
    description:"Invalid Credentials , your old password is wrong.",
    example:{
        message:"Invalid Credentials , your old password is wrong.",
        code:"INVALID_CREDENTIALS",
        statusCode:401
      }
})
@ApiUnauthorizedResponse({
  description:"JWT missing  access-token, or expired. if expired should login again.",
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
    }    
})
@ApiConflictResponse({
  description:"Your new password not same confirm password",
  example:{
        message:"Your new password not same confirm password",
        code:"CONFLICT",
        statusCode:409
        }
})
@ApiInternalServerErrorResponse({
    description:"Failed to set your new passwd . try again.",
    example:{message:"Failed to set your new passwd.",code:"FAILED",statusCode:500}
})
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard)
async resetPassword(@Body() passwords:any,@Req() request:express.Request){
  const user:any = request.user
  return await this.authService.resetPasswd(passwords,user.id)
}


}


