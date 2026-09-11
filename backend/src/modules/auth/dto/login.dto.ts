import { PickType } from "@nestjs/swagger";
import { UserFields } from "./user-fileds.dto";

export class LoginUser extends PickType(UserFields,['email','lastLoginAt','password']){
    password!: string;
}