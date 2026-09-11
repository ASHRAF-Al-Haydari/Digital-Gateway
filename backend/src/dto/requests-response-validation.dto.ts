import { PickType } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsNotEmpty, IsString, Matches, MaxLength } from "class-validator";
import { ContactMassageFields, PostFields, ProjectFields, ServicesFields, SettingsFields, TechnologyFields } from "src/common/entity-fields.dto";
import { UserFields } from "src/modules/auth/dto/user-fileds.dto";
//PickType

export class PostRequestDto extends PickType(PostFields,['userPost']){
    @Expose({name:"userPost"})
    userPost!: string;
}

class UserPostResponse extends PickType(UserFields,['userFullName','userName','profileImage']){}

export class PostResponseDto extends PickType(PostFields,['userPost']){
    @Type(()=>UserPostResponse)
    @Expose({name:"author"})
    user!:UserPostResponse;
}


export class ProjectResponseDto extends PickType(ProjectFields,['projectId','projectName','slug','description','shortDescription','type','visitUrl','projectImages']){
}

export class SettingsResponseDto extends SettingsFields{}

export class CreateContactMassageRequestDto extends PickType(ContactMassageFields,['subject','phoneNumber','message']){
    @Expose({name:"phoneNumber"})
    phoneNumber!:string; 
}
export class TechnologyResponseDto extends TechnologyFields{}
export class ServicesResponseDto extends ServicesFields{}
