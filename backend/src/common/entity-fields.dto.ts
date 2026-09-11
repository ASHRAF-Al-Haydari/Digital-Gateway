import { ApiProperty, PickType } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsAlpha, IsBoolean, IsDate, IsEmail, IsEnum, IsIn, IsMobilePhone, isNotEmpty, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsUrl, IsUUID, Length, Matches, MaxLength } from "class-validator";
import { UserFields } from "src/modules/auth/dto/user-fileds.dto";
import { ProjectCategory } from "./enum";
import {IsCUID} from './idGuid-validation.decorator'
export class PostFields{
    @IsCUID()
    @IsString()
    @Expose({name:"id"})
    postId!:string;

    @ApiProperty({
    name:"userPost",
    type:"string",
    nullable:false,
    default:"kjjhsdjs djshjdhs shsjdgsjhg hgsjgdjkshgdjs",
    required:true,
    maxLength:300,
    description:"Enter your opinion about us in your post .Post should contain arabic or english or numbers characters."
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z0-9 ,.]+$/,{message:"Post should contain arabic or english or numbers characters."})
    @MaxLength(300)
    @Expose({name:"content"})
    userPost!:string;

    @ApiProperty({
    name:"published",
    type:"boolean",
    nullable:false,
    default:false,
    required:true,
    description:"Detect witch Posts will shown to users."
    })
    @IsBoolean()
    @Expose({name:"published"})
    published!:boolean;
}


export class ProjectFields{
    @IsCUID()
    @IsString()
    @Expose({name:"id"})
    projectId!:string;
    
    @ApiProperty({
    name:"projectName",
    type:"string",
    nullable:false,
    default:"Tag-Mole e-ecommerce web store",
    required:true,
    maxLength:20,
    minLength:5,
    description:"Enter Project name .Projects name must contain arabic or english  characters."
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z ]+$/,{always:true,message:"Projects name must contain arabic or english characters."})
    @Length(5,20)
    @Expose({name:"title"})
    projectName!:string;              //real column in db name title

    @ApiProperty({
    name:"slug",
    type:"string",
    nullable:false,
    default:"Tag-Mole-Web-Stor",
    required:true,
    maxLength:50,
    minLength:10,
    description:"Enter Projects Slug.Slug must contain English characters.."
    })
    @IsString()
    @Matches(/^[a-zA-Z \- ]+$/,{always:true,message:"Slug must contain English characters."})
    @IsNotEmpty()
    @Length(10,50)
    @Expose({name:"slug"})
    slug!:string;          

    @ApiProperty({
    name:"shortDescription",
    type:"string",
    nullable:true,
    default:"kjjhsdjs djshjdhs shsjdgsjhg hgsjgdjkshgdjs",
    required:false,
    maxLength:60,
    minLength:20,
    description:"Enter short description for project .Projects Short Description must contain arabic or english or numbers characters."
    })
    @IsString()
    @Length(20,60)
    @IsOptional()
    @Matches(/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z0-9 ,.]+$/,{always:true,message:"Projects Short Description must contain arabic or english or numbers characters."})
    @Expose({name:"shortDescription"})
    shortDescription!:string|null;

    @ApiProperty({
    name:"description",
    type:"string",
    nullable:false,
    default:"kjjhsdjs djshjdhs shsjdgsjhg hgsjgdjkshgdjs",
    required:true,
    maxLength:300,
    minLength:100,
    description:"Enter  description for project .Projects  Description must contain arabic or english or numbers characters."
    })
    @IsString()
    @Length(100,300)
    @IsOptional()
    @Matches(/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z0-9 ,.]+$/,{always:true,message:"Projects  Description must contain arabic or english or numbers characters."})
    @Expose({name:"description"})
    description!:string;

    @ApiProperty({
    name:"type",
    type:"string",
    nullable:false,
    required:true,
    enumName:"ProjectType",
    enum:ProjectCategory,
    description:"Enter project type."
    })
    @IsString()
    @IsEnum(ProjectCategory)
    @Expose({name:"category"})
    type!:ProjectCategory;              //category

    @ApiProperty({
    name:"visitUrl",
    type:"string",
    nullable:false,
    required:true,
    format:'uri',
    description:"Enter project url. Enter project url supported https protocol."
    })
    @IsUrl({protocols:['https']},{always:true,message:"Enter project url supported https protocol. "})
    @Expose({name:"projectUrl"})
    visitUrl!:string;           //projectUrl

    @ApiProperty({
    name:"projectImages",
    type:"array",
    // nullable:false,
    // isArray:true,
    required:true,
    items:{type:"file",format:"binary"},
    maxItems:3,
    description:"Enter project Images [png,jpg,jpeg] types,Maximum files is 3.Projects Images must png,jpg,jpeg types."
    })
    @Expose({name:"images"})       
    projectImages!:any[];          //images

    @IsDate()
    @Expose({name:"createdAt"})
    createdAt!:Date;
    @IsDate()
    @Expose({name:"updatedAt"})
    updatedAt!:Date;
}


export class ServicesFields{
    @IsCUID()
    @IsString()
    @Expose({name:"id"})
    ServiceId!:string;

    @ApiProperty({
    name:"serviceName",
    type:"string",
    nullable:false,
    default:"web developing",
    required:true,
    maxLength:30,
    minLength:5,
    description:"Enter service name .services name must contain arabic or english  characters."
    })
    @IsString()
    @IsNotEmpty()
    @Length(5,30)
    @Matches(/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z0-9 .]+$/,{always:true,message:"Services name must contain arabic or english or versions characters."})
    @Expose({name:"title"})
    serviceName!:string;
    
    @ApiProperty({
    name:"description",
    type:"string",
    nullable:true,
    default:"gf  fhfjhfkgf j h fkjhf jf gf ljf hjh gjhgjhg hjgh",
    required:false,
    maxLength:300,
    minLength:50,
    description:"Enter service description .services description must contain arabic or english  characters."
    })
    @IsString()
    @Length(50,300)
    @Matches(/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z ,.]+$/,{always:true,message:"Services description must contain arabic or english characters."})
    @IsOptional()
    @Expose({name:"description"})
    description!:string|null;

    @ApiProperty({
    name:"iconUrl",
    type:"file",
    nullable:true,
    // default:"",
    format:"binary",
    example:"hfjhgdjfdjh.[png,jpg,jpeg]",
    required:false,
    description:"Enter icon Image [png,jpg,jpeg] types .icon Image must png,jpg,jpeg types."
    })
    @IsOptional()
    @Expose({name:"icon"})
    iconUrl!:string|null;
}


export class TechnologyFields{
    @IsCUID()
    @IsString()
    @Expose({name:"id"})
    TechId!:string;

    @ApiProperty({
    name:"technologyName",
    type:"string",
    nullable:false,
    default:"Nodejs",
    required:true,
    maxLength:30,
    minLength:5,
    description:"Enter Technology name must in english lang .Technology name must contain  english  characters."
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha('en-US',{always:true,message:"Technology name must in english lang."})
    @Length(5,30)
    @Expose({name:"name"})
    technologyName!:string;
    
    @ApiProperty({
    name:"logo",
    type:"file",
    nullable:true,
    // default:"",
    format:"binary",
    example:"hfjhgdjfdjh.[png,jpg,jpeg]",
    required:false,
    description:"Enter logo Image [png,jpg,jpeg] types .logo Image must png,jpg,jpeg types."
    })
    @IsString()
    @IsOptional()
    @Expose({name:"logo"})
    logo!:string|null;
}

export class ContactMassageFields extends PickType(UserFields,['userFullName','email']){
    @IsCUID()
    @IsString()
    @Expose({name:"id"})
    ContactId!:string;

    @Expose({name:"name"})
    userFullName!:string;

    @ApiProperty({
    name:"phoneNumber",
    type:"string",
    nullable:false,
    example:"+967714546326",
    required:true,
    description:"Enter phone  number .phone number must correct like in example."
    })
    @IsString()
    @IsNotEmpty()
    @IsMobilePhone()
    @Expose({name:"phone"})
    phoneNumber!:string; 
    
    @ApiProperty({
    name:"subject",
    type:"string",
    nullable:true,
    required:false,
    maxLength:50,
    minLength:20,
    description:"Enter subject  .Subject must contain arabic or english or numbers characters."
    })
    @IsString()
    @Length(20,50)
    @IsOptional()
    @Matches(/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z0-9 ,.]+$/,{always:true,message:"Subject must contain arabic or english or numbers characters."})
    @Expose({name:"subject"})
    subject!:string|null;  
    
    @ApiProperty({
    name:"message",
    type:"string",
    nullable:false,
    maxLength:300,
    minLength:50,
    required:true,
    description:"Enter Message .Message must contain arabic or english or numbers characters."
    })
    @IsString()
    @IsNotEmpty()
    @Length(50,300)
    @Matches(/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z0-9 ,.]+$/,{always:true,message:"Message must contain arabic or english or numbers characters."})
    @Expose({name:"message"})
    message!:string;

    @IsDate()
    @Expose({name:"createdAt"})
    createdAt!:Date;
}

export class SettingsFields{
    @IsCUID()
    @IsString()
    @Expose({name:"id"})
    SettingId!:string;

    @ApiProperty({
    name:"companyName",
    type:"string",
    nullable:false,
    maxLength:20,
    minLength:10,
    required:true,
    description:"Company name must contain arabic or english characters."
    })
    @IsString()
    @IsNotEmpty()
    @Length(10,20)
    @Matches(/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z ]+$/,{always:true,message:"Company name must contain arabic or english characters."})
    @Expose({name:"companyName"})
    companyName!:string;

    @ApiProperty({
    name:"logo",
    type:"file",
    nullable:true,
    format:"binary",
    example:"hfjhgdjfdjh.[png,jpg,jpeg]",
    required:false,
    description:"Enter logo Image [png,jpg,jpeg] types .logo Image must png,jpg,jpeg types."
    })
    @IsString()
    @IsOptional()
    @Expose({name:"logo"})
    logo!:string|null; 
    
    
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
    @IsNotEmpty()
    @Expose({name:"email"})
    email!:string;

    @ApiProperty({
    name:"phoneNumber",
    type:"string",
    nullable:false,
    // default:"",
    // format:"",
    example:"+967714546326",
    required:true,
    description:"Enter phone  number .phone number must correct like in example."
    })
    @IsString()
    @IsNotEmpty()
    @IsMobilePhone()
    @Expose({name:"phone"})
    phoneNumber!:string;
    
    
    @ApiProperty({
    name:"companyAddress",
    type:"string",
    nullable:false,
    maxLength:50,
    minLength:30,
    required:true,
    description:"Company Address must contain arabic or english or numbers characters."
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z0-9 ,.]+$/,{always:true,message:"Company Address must contain arabic or english or numbers characters."})
    @Length(30,50)
    @Expose({name:"address"})
    companyAddress!:string;

    
    
    @ApiProperty({
    name:"facebook",
    type:"string",
    nullable:false,
    required:true,
    format:'uri',
    description:"Enter facebook url. Enter facebook url supported https protocol."
    })
    @IsString()
    @IsUrl({protocols:['https']},{always:true,message:"Enter Facebook url supported https protocol. "})
    @IsOptional()
    @Expose({name:"facebook"})
    facebook!:string|null; 

    @ApiProperty({
    name:"instagram",
    type:"string",
    nullable:false,
    required:true,
    format:'uri',
    description:"Enter instagram url. Enter instagram url supported https protocol."
    })
    @IsString()
    @IsUrl({protocols:['https']},{always:true,message:"Enter instagram url supported https protocol. "})
    @IsOptional()      
    @Expose({name:"instagram"}) 
    instagram!:string|null;

    @ApiProperty({
    name:"whatsapp",
    type:"string",
    nullable:false,
    required:true,
    format:'uri',
    description:"Enter whatsapp url. Enter whatsapp url supported https protocol."
    })
    @IsString()
    @IsUrl({protocols:['https']},{always:true,message:"Enter whatsapp url supported https protocol. "})
    @IsOptional() 
    @Expose({name:"whatsapp"})      
    whatsapp!:string|null; 
}