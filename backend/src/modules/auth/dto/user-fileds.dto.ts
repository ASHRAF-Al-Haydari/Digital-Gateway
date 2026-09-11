import { IsAlphanumeric, IsDate, IsEmail, IsEnum, IsOptional, IsString, IsUUID, Matches, MaxLength } from "class-validator";
import { Role } from '../../../generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from "class-transformer";
export class UserFields{
    @IsUUID()
    @IsString()
    @Expose({name:"id"})
    userId!: string;

    @ApiProperty({
    description:"This user full name ",
    example:"ashraf abdul-fattah hazaea fazaea",
    name:"userFullName",
    type:"string",
    required:true,
    })
    @IsString()
    @Matches(/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z0-9 ]+$/,{always:true,message:"userFullName should contain arabic or english or numbers characters."})
    @Expose({name:"fullName"})
    userFullName!: string;
    
    @ApiProperty({
    description:"You must enter the userName .",
    example:"ashraf235",
    name:"userName",
    type:"string",
    nullable:false,
    required:true
  })
    @IsString()
    @IsAlphanumeric("en-US",{always:true,message:"username must contain english characters with numbers without spaces."})
    @Expose({name:"username"})
    userName!: string;

    @ApiProperty({
    description:"You must enter your email",
    example:"ashraf235@gmail.com",
    name:"email",
    type:"string",
    nullable:false,
    format:'email',
    required:true,
  })
    @IsEmail()
    @Expose({name:"email"})
    email!: string;

    @ApiProperty({
    description:"You must enter your password",
    example:"@88jshdn123",
    name:"password",
    type:"string",
    nullable:false,
    minLength:10,
    format:'password',
    maxLength:30,
    required:true,
  })
    @IsString()
    @MaxLength(30)
    @Expose({name:"password"})
    password?:string;

    @Expose({name:"provider"})
    provider!: string;
    @Expose({name:"googleId"})
    googleId!: string;  

    @Expose({name:"salt"})
    salt!: string;

    @ApiProperty({
    description:"User role ['ADMIN',CUSTOMER']",
    example:"CUSTOMER",
    name:"role",
    type:"string",
    enumName:"Role",
    enum:[Role.ADMIN,Role.CUSTOMER],
    default:Role.CUSTOMER
    })
    @IsEnum(Role)
    @Expose({name:"role"})
    role:Role = Role.CUSTOMER;

    @ApiProperty({
    description:" User profile image",
    example:"jahdhsdh.png",
    name:"profileImage",
    type:"string",
    nullable:true,
    })
    @IsString()
    @IsOptional()
    @Expose({name:"profileImage"})
    profileImage: string = "1786665456082-853792458.png";

    @IsOptional()
    @IsDate()
    @Expose({name:"lastLoginAt"})
    lastLoginAt: Date = new Date(); // Use 'Date' not 'DateTime';
    
    @Expose({name:"createdAt"})
    createdAt!: Date;
    @Expose({name:"updatedAt"})
    updatedAt!: Date;
}
