import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from "crypto";
import { LoginUser } from './dto/login.dto';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { JwtPayloadType } from 'src/utils/types';
import { RefreshTokenResponse, TokenResponse } from './dto/user-response.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
    private readonly SALT_ROUNDS = 10;
  constructor(private prisma:PrismaService,private jwtService:JwtService) {}
  

  /**
   * register user 
   * @param user 
   * @returns TokenResponse
   * 
   */
  async  register(user:CreateUserDto):Promise<TokenResponse>{
   //hash password
   const saltt = await bcrypt.genSalt(this.SALT_ROUNDS)
   const saltpassword=user.password + saltt
   const hashPassword = await crypto.createHash("sha512").update(saltpassword).digest("hex")
  //  console.log(hashPassword)
   user.password=hashPassword;
   //create user
   const result = await this.prisma.user.create({data:{
    fullName:user.userFullName,
    username:user.userName,
    email:user.email,
    password:user.password,
    salt:saltt,
    role:user.role,
    lastLoginAt:user.lastLoginAt,
    profileImage:user.profileImage
   }});
  //  console.log("results:\n")
  //  console.log(result)
  //  const {password,salt,createdAt,updatedAt,lastLoginAt,id,role,...userResponse}= result;
  //  console.log(userResponse);
  const userResponse:TokenResponse=new TokenResponse();
    userResponse.accessToken=await this.generateToken({id:result.id,username:result.username,email:result.email,role:result.role,fullname:result.fullName})
    userResponse.refreshToken=await this.generateRefreshToken({id:result.id,email:result.email})
   return userResponse;
  }

  //check if user registered or new user will register
  async checkUserExist(email:string,username:string){
        //check existing user
   const existingUser = await this.prisma.user.findFirst({where:{
    // email:user.email
            OR: [
          { email: email },
          { username: username },
        ],
   }});
    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email is already registered.');
      }
      if (existingUser.username === username) {
        throw new ConflictException('Username is used ,choose anther username ');
      }
    }

    return existingUser
  }

//user login by google
  async googleLogin (user:any):Promise<TokenResponse>{
   //check existing user
   const existingUser = await this.prisma.user.findFirst({where:{
    // email:user.email
    email: user.email 
   }});

    if (existingUser) {
    const userResponse:TokenResponse=new TokenResponse();
    userResponse.accessToken=await this.generateToken({id:existingUser.id,username:existingUser.username,email:existingUser.email,role:existingUser.role,fullname:existingUser.fullName})
    userResponse.refreshToken=await this.generateRefreshToken({id:existingUser.id,email:existingUser.email})
    return userResponse
      
      // if (existingUser.username === user.username) {
      //   throw new ConflictException('Username is used ,choose anther username ');
      // }
    }

  //register user if no existing in database
    const result = await this.prisma.user.create({data:{
    fullName:user.fullname,
    username:user.username,
    email:user.email,
    // role:user.role,
    // password:"",  //remove it 
    // salt:'',
    googleId:user.googleId,
    provider: user.provider,
    lastLoginAt:new Date(),
    profileImage:user.profileImage
   }});
     const userResponse:TokenResponse=new TokenResponse();
    userResponse.accessToken=await this.generateToken({id:result.id,username:result.username,email:result.email,role:result.role,fullname:result.fullName})
    userResponse.refreshToken=await this.generateRefreshToken({id:result.id,email:result.email})
   return userResponse;

  }

  //user login
  async login(user:LoginUser):Promise<TokenResponse>{
    //check if user registered
    const existedUser = await this.prisma.user.findUnique({where:{
      email:user.email
    }})
    if(!existedUser){
      throw new UnauthorizedException("Invalid Credentials")
    }
    
    if(!existedUser.password){
      throw new UnauthorizedException("Invalid Credentials")
    }
    // verification of user password
    const passwordSalt= user.password + existedUser.salt
    const hashPassword = await crypto.createHash("sha512").update(passwordSalt).digest("hex")
    const isValid = await crypto.timingSafeEqual(Buffer.from(hashPassword),Buffer.from(existedUser.password))
    if(!isValid){
      throw new UnauthorizedException("Invalid Credentials")
    }
    
  const userResponse:TokenResponse=new TokenResponse();
    userResponse.accessToken=await this.generateToken({id:existedUser.id,username:existedUser.username,email:existedUser.email,role:existedUser.role,fullname:existedUser.fullName})
    userResponse.refreshToken=await this.generateRefreshToken({id:existedUser.id,email:existedUser.email})
    return userResponse
  }





  private async generateToken(payload:JwtPayloadType):Promise<string>{
     const accessToken= await this.jwtService.signAsync(payload)
    //  console.log(accessToken)
    return accessToken
  }

  private async generateRefreshToken(payload:any){
    const refreshToken = await this.jwtService.signAsync(payload,
      {secret:process.env.JWT_REFRESH_TOKEN_KEY,expiresIn:'7d'})
    return refreshToken
  }

  // refresh expired access-token 
  public async refreshToken(reftoken:string):Promise<RefreshTokenResponse>{
        try {
      const token = reftoken;
      const {iat,exp,...payload} = await this.jwtService.verifyAsync(token,{secret:process.env.JWT_REFRESH_TOKEN_KEY})
      
      const user:any = await this.prisma.user.findUnique({where:{
        id:payload.id},select:{id:true,email:true,username:true,role:true}});

      const tokens:RefreshTokenResponse= new RefreshTokenResponse();
       tokens.accessToken= await this.generateToken(user!)
       tokens.refreshToken = await this.generateRefreshToken({id:user!.id})
       return tokens
      // return {"access-token":accessToken,"refresh-token":refreshToken};

    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException({
          message: 'refresh-token expired',
          code: 'TOKEN_EXPIRED',
          statusCode:401
        });
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException({
          message: 'Invalid token',
          code: 'TOKEN_INVALID',
          statusCode:401
        });
      }
      throw error;
    }
  }


//reset user new password
async resetPasswd(passwords:ResetPasswordDto,userId:string):Promise<{}>{
        const userPasswd = await this.prisma.user.findUnique({where:{id:userId},select:{password:true,salt:true}})
        if(!userPasswd?.password)
          throw new NotFoundException({
            message:'You do not have password, go to create password no reset password.',
            code:"NOT_FOUND",
            statusCode:404
        })

    // check is confirm password same new password
    if(passwords.newPassword !== passwords.confirmPassword)
        throw new ConflictException({
      message:"Your new password not same confirm password",
      code:"CONFLICT",
      statusCode:409
      })

    // verification of user old password
    const passwordSalt= passwords.oldPassword + userPasswd.salt
    const hashPassword = await crypto.createHash("sha512").update(passwordSalt).digest("hex")
    const isValid = await crypto.timingSafeEqual(Buffer.from(hashPassword),Buffer.from(userPasswd.password))
    if(!isValid)
      throw new UnauthorizedException({
        message:"Invalid Credentials , your old password is wrong.",
        code:"INVALID_CREDENTIALS",
        statusCode:401
      })
    
    // create new user password hash 
    const newSalt = await bcrypt.genSalt(this.SALT_ROUNDS)
    const newPasswordSalt= passwords.newPassword + newSalt
    const newHashPassword = await crypto.createHash("sha512").update(newPasswordSalt).digest("hex")
    
    const newUpdatePasswd = await this.prisma.user.update({where:{
      id:userId
    },data:{
      password:newHashPassword,
      salt:newSalt
    },select:{
      username:true,
      fullName:true,
      email:true
    }});

    //check if updated without problems
    if(!newUpdatePasswd)
      throw new InternalServerErrorException(
              {message:"Failed set your new passwd .",code:"FAILED",statusCode:500})
    
    return {message:"Success set your new passwd .",code:"SUCCESS",statusCode:200}
  }

}