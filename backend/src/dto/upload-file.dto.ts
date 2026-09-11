import { ApiProperty } from "@nestjs/swagger";
import { IsAlpha, IsAlphanumeric, IsString, Length, Matches } from "class-validator";

export class ProjectsImagesUploadDto {
  @ApiProperty({ type: "array",
    name:"projects",
    items:{type:'file',format:"binary"},
    maxItems:3,
    description:"Maximum files is 3",
})
  images!: any[];
}

export class ProfileUpdateDto {
  @ApiProperty({
    name:"fullName",
    type:"string",
    minLength:5,
    nullable:false,
    default:"ashraf abdul-fattah hazaea fazaea",
    required:true,
    description:"Update your username. the username should more than 5 characters, and contain arabic or english characters with numbers and spaces."
  })
  @IsString()
  @Length(5)
  @Matches(/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z0-9\s]+$/,{always:true,message:"fullName should contain arabic or english or numbers characters."})
  // @IsAlphanumeric("en-US",{})
  fullName!:string;

  @ApiProperty({
    name:"username",
    type:"string",
    default:"ashraf",
    minLength:5,
    nullable:false,
    required:true,
    description:"Update your username. the username should more than 5 characters, and contain characters with numbers without spaces."
  })
  @IsString()
  @Length(5)
  @IsAlphanumeric("en-US",{always:true,message:"username must contain english characters with numbers without spaces."})
  username!:string;

  @ApiProperty({ type: 'file', format: 'binary',name:"profiles",required:true})
  file: any;
}
