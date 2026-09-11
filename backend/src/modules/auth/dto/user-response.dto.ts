import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsString } from 'class-validator';
import { UserFields } from "./user-fileds.dto";



export class RefreshTokenResponse{
  constructor(){}
        @ApiProperty({
        description:"new access-token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtc2NlYTZqYTAwMDBjNGRiM28ycGxhYWQiLCJ1c2VybmFtZSI6ImFzaHJhZjIzNSIsImVtYWlsIjoiYXNocmFmQGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc4NTk2ODAyNywiZXhwIjoxNzg1OTY4MDMyfQ.fQBGgd4hs7Tu6R0_G1u6V9w1M_neRTEZAdDB_maAoxw",
        name:"accessToken",
        type:"string",
        nullable:false,
        readOnly:true
      })
      @IsString()
      accessToken!: string;
        @ApiProperty({
        description:"new refresh-token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtc2NlYTZqYTAwMDBjNGRiM28ycGxhYWQiLCJ1c2VybmFtZSI6ImFzaHJhZjIzNSIsImVtYWlsIjoiYXNocmFmQGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc4NTk2ODAyNywiZXhwIjoxNzg1OTY4MDMyfQ.fQBGgd4hs7Tu6R0_G1u6V9w1M_neRTEZAdDB_sfAhnv",
        name:"refreshToken",
        type:"string",
        nullable:false,
        readOnly:true
      })
      @IsString()
      refreshToken!: string;
}

export class TokenResponse{
  constructor(){}
        @ApiProperty({
        description:"access-token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtc2NlYTZqYTAwMDBjNGRiM28ycGxhYWQiLCJ1c2VybmFtZSI6ImFzaHJhZjIzNSIsImVtYWlsIjoiYXNocmFmQGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc4NTk2ODAyNywiZXhwIjoxNzg1OTY4MDMyfQ.fQBGgd4hs7Tu6R0_G1u6V9w1M_neRTEZAdDB_maAoxw",
        name:"accessToken",
        type:"string",
        nullable:false,
        readOnly:true
      })
      @IsString()
      accessToken!: string;
        @ApiProperty({
        description:"refresh-token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtc2NlYTZqYTAwMDBjNGRiM28ycGxhYWQiLCJ1c2VybmFtZSI6ImFzaHJhZjIzNSIsImVtYWlsIjoiYXNocmFmQGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc4NTk2ODAyNywiZXhwIjoxNzg1OTY4MDMyfQ.fQBGgd4hs7Tu6R0_G1u6V9w1M_neRTEZAdDB_sfAhnv",
        name:"refreshToken",
        type:"string",
        nullable:false,
        readOnly:true
      })
      @IsString()
      refreshToken!: string;
}

export class AccessTokenResponse{
        @ApiProperty({
        description:"access-token",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtc2NlYTZqYTAwMDBjNGRiM28ycGxhYWQiLCJ1c2VybmFtZSI6ImFzaHJhZjIzNSIsImVtYWlsIjoiYXNocmFmQGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc4NTk2ODAyNywiZXhwIjoxNzg1OTY4MDMyfQ.fQBGgd4hs7Tu6R0_G1u6V9w1M_neRTEZAdDB_maAoxw",
        name:"accessToken",
        type:"string",
        nullable:false,
        readOnly:true
      })
      @IsString()
      accessToken!: string;
}



// export class AdminResponse{

//      @ApiProperty({
//         description:"User uuid ,it serial of random characters",
//         example:"jhgdshdhghsgjhjsds456",
//         name:"id",
//         type:"string",
//         readOnly:true
//       })
//     @IsUUID()
//     id!:string;

//      @ApiProperty({
//         description:"User full name ",
//         example:"ashraf abdul-fattah hazaea fazaea",
//         name:"fullname",
//         type:"string",
//         readOnly:true
//       })
//       @IsString()
//       @IsOptional()
//       fullname?: string;
    
//         @ApiProperty({
//         description:"Username of user",
//         example:"ashraf235 | ashraf@45",
//         name:"username",
//         type:"string",
//         nullable:false,
//         readOnly:true
//       })
//       @IsString()
//       username!: string;
    
//         @ApiProperty({
//         description:"User email",
//         example:"ashraf235@gmail.com",
//         name:"email",
//         type:"string",
//         nullable:false,
//         format:'email',
//         readOnly:true
//       })
//       @IsEmail()
//       email!: string;
    
//         @ApiProperty({
//         description:"User hash password",
//         example:"ahhsgghshjs5454...",
//         name:"password",
//         type:"string",
//         nullable:false,
//         format:'password',
//         readOnly:true
//       })
//       @IsString()
//       password!: string;
      
//         @ApiProperty({
//         description:"User role ['ADMIN',CUSTOMER'] ",
//         example:"CUSTOMER",
//         name:"role",
//         type:"string",
//         nullable:false,
//         enumName:"Role",
//         enum:[Role.ADMIN,Role.CUSTOMER],
//         default:Role.CUSTOMER,
//         readOnly:true
//       })
//       @IsEnum(Role)
//       role:Role = Role.CUSTOMER

//         @ApiProperty({
//         description:" User profile url image",
//         example:"http://jahdhsdh.png",
//         name:"profileImage",
//         type:"string",
//         nullable:true,
//         format:'uri',
//         default:"http://jhshdhsh.png",
//         readOnly:true
//       })
//       @IsString()
//       @IsOptional()
//       profileImage?: string; // Optional field
     
//       @ApiProperty({
//         description:"Last user login date.",
//         example:"10:50AM 23/7/2026",
//         name:"lastLoginAt",
//         type:"string",
//         nullable:true,
//         format:'date',
//         readOnly:true
//       })
//       @IsOptional()
//       @IsDate()
//       lastLoginAt?: Date; // Use 'Date' not 'DateTime'

//       @ApiProperty({
//         description:"Register user date.",
//         example:"10:50AM 23/7/2026",
//         name:"createdAt",
//         type:"string",
//         nullable:true,
//         format:'date',
//         readOnly:true
//       })
//       @IsOptional()
//       @IsDate()
//       createdAt?: Date; // Use 'Date' not 'DateTime'

//       @ApiProperty({
//         description:"Update user data date.",
//         example:"10:50AM 23/7/2026",
//         name:"updatedAt",
//         type:"string",
//         nullable:true,
//         format:'date',
//         readOnly:true
//       })
//       @IsOptional()
//       @IsDate()
//       updatedAt?: Date; // Use 'Date' not 'DateTime'

// }


// export class CustomerResponse{
//      @ApiProperty({
//         description:"User full name ",
//         example:"ashraf abdul-fattah hazaea fazaea",
//         name:"fullname",
//         type:"string",
//         readOnly:true
//       })
//       @IsString()
//       @IsOptional()
//       fullname!: string;
    
//         @ApiProperty({
//         description:"Username of user",
//         example:"ashraf235 | ashraf@45",
//         name:"username",
//         type:"string",
//         nullable:false,
//         readOnly:true
//       })
//       @IsString()
//       username!: string;
    
//         @ApiProperty({
//         description:"User email",
//         example:"ashraf235@gmail.com",
//         name:"email",
//         type:"string",
//         nullable:false,
//         format:'email',
//         readOnly:true
//       })
//       @IsEmail()
//       email!: string;
    
//         @ApiProperty({
//         description:" User profile url image",
//         example:"http://jahdhsdh.png",
//         name:"profileImage",
//         type:"string",
//         nullable:true,
//         format:'uri',
//         default:"http://jhshdhsh.png",
//         readOnly:true
//       })
//       @IsString()
//       @IsOptional()
//       profileImage!: string; // Optional field

// }
