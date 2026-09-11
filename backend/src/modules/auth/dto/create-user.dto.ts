// create-user.dto.ts
import { IsString, MaxLength, IsStrongPassword, IsNotEmpty,MinLength} from 'class-validator';

import { ApiProperty,PickType } from '@nestjs/swagger';
import { UserFields } from './user-fileds.dto';

export class CreateUserDto extends PickType(UserFields,['userFullName','userName','password','email','role','lastLoginAt','profileImage']){
  @IsStrongPassword({minLength:10,minLowercase:3,minNumbers:1,minSymbols:1,minUppercase:1},{always:true,message:"Enter strong password.must contain 3 min lowercase letters and 1 min [numbers,symbols,uppercase letter] "})
  password?: string;}

export class VerifyCodeDto extends PickType(CreateUserDto,['email']){
        @ApiProperty({
        description:"User verify sended code",
        example:"132654",
        name:"code",
        type:"string",
        nullable:false,
        minLength:6,
        maxLength:6
        // readOnly:true
      })
      @IsNotEmpty()
      @MinLength(6)
      @MaxLength(6)
      @IsString()
      code!: string;
}