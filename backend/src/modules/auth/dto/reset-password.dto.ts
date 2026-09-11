import { ApiProperty } from "@nestjs/swagger";
import { IsStrongPassword, IsString, MaxLength } from "class-validator";

export class ResetPasswordDto{
        @ApiProperty({
        description:"You must enter old password",
        example:"@88jshdn123",
        name:"oldPassword",
        type:"string",
        nullable:false,
        format:'password',
        maxLength:30,
        minLength:10
      })
        // @IsStrongPassword({minLength:10},{always:true,message:"Enter strong password"})
        @IsString()
        @MaxLength(30)
        oldPassword!:string;

        @ApiProperty({
        description:"You must enter new password",
        example:"5sd4s5f4H%&",
        name:"newPassword",
        type:"string",
        nullable:false,
        format:'password',
        maxLength:30,
        minLength:10
      })
        @IsStrongPassword({minLength:10,minLowercase:3,minNumbers:1,minSymbols:1,minUppercase:1},{always:true,message:"Enter strong password.must contain 3 min lowercase letters and 1 min [numbers,symbols,uppercase letter] "})
        @IsString()
        @MaxLength(30)
        newPassword!:string;

        @ApiProperty({
        description:"You must enter confirm password",
        example:"5sd4s5f4H%&",
        name:"confirmPassword",
        type:"string",
        nullable:false,
        format:'password',
        maxLength:30,
        minLength:10
      })
        @IsStrongPassword({minLength:10,minLowercase:3,minNumbers:1,minSymbols:1,minUppercase:1},{always:true,message:"Enter strong password.must contain 3 min lowercase letters and 1 min [numbers,symbols,uppercase letter] "})
        @IsString()
        @MaxLength(30)
        confirmPassword!:string;
}