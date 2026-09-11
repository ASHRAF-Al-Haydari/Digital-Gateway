import { ApiProperty, PickType } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { ContactMassageFields, PostFields, ProjectFields, ServicesFields, SettingsFields, TechnologyFields } from "src/common/entity-fields.dto";
import { ProjectCategory } from "src/common/enum";
import { UserFields } from "src/modules/auth/dto/user-fileds.dto";

export class UsersResponseDto extends PickType(UserFields,['userId','userName','userFullName','role','profileImage','provider','email','createdAt','updatedAt','lastLoginAt']){}


export class UploadProjectsDto extends PickType(ProjectFields,['projectImages','projectName','shortDescription','description','slug','type','visitUrl']){
   @Expose({name:"slug"})
    slug!: string;
    @Expose({name:"description"})
    description!: string;
    @Expose({name:"shortDescription"})
    shortDescription!: string | null;
    @Expose({name:"visitUrl"})
    visitUrl!: string;
    @Expose({name:"type"})
    type!: ProjectCategory;
    @Expose({name:"projectName"})
    projectName!: string;
}

export class UpdateProjectDto extends PickType(ProjectFields,['projectName','shortDescription','description','slug','type','visitUrl','projectId']){
    @ApiProperty({
        required:true,
        type:"string",
        name:"projectId",
        description:"Enter the project id to detect witch project will updated.",
    })
    @Expose({name:"projectId"})
    projectId!: string;
    
    @Expose({name:"slug"})
    slug!: string;
    @Expose({name:"description"})
    description!: string;
    @Expose({name:"shortDescription"})
    shortDescription!: string | null;
    @Expose({name:"visitUrl"})
    visitUrl!: string;
    @Expose({name:"type"})
    type!: ProjectCategory;
    @Expose({name:"projectName"})
    projectName!: string;
}
export class UpdateProjectImageDto{
    @ApiProperty({ type: 'file', format: 'binary',name:"projectImage"})
      projectImage:any;
}
export class ProjectResponseDto extends ProjectFields{}


class UserPostResponse extends PickType(UserFields,['userFullName','userName','email','profileImage']){}
export class PostsResponseDto extends PickType(PostFields,['postId','userPost','published']){
    @Type(()=>UserPostResponse)
    @Expose({name:"author"})
    user!:UserPostResponse;
}
class PostsResponse extends PickType(PostFields,['postId','userPost','published']){}
export class UserPostsResponseDto extends PickType(UserFields,['userId','userFullName','userName','email','profileImage','role']){
    @Type(()=>PostsResponse)
    @Expose({name:"posts"})
    posts!:PostsResponse;
}


export class ServicesResponseDto extends ServicesFields{}
export class CreateServicesRequestDto extends PickType(ServicesFields,['description','iconUrl','serviceName']){
    @Expose({name:"description"})
    description!: string | null;
    @Expose({name:"serviceNAme"})
    serviceName!: string;
    @Expose({name:"iconUrl"})
    iconUrl!: string | null;
}
export class ServicesRequestDto extends PickType(ServicesFields,['ServiceId','description','iconUrl','serviceName']){
    @Expose({name:"ServiceId"})
    ServiceId!: string;
    @Expose({name:"description"})
    description!: string | null;
    @Expose({name:"serviceNAme"})
    serviceName!: string;
    @Expose({name:"iconUrl"})
    iconUrl!: string | null;
}

export class TechnologyResponseDto extends TechnologyFields{}
export class CreateTechnologyRequestDto extends PickType(TechnologyFields,['logo','technologyName']){
    @Expose({name:"technologyName"})
    technologyName!:string;
}
export class TechnologyRequestDto extends PickType(TechnologyFields,['TechId','logo','technologyName']){
    @Expose({name:"TechId"})
    TechId!:string;
    @Expose({name:"technologyName"})
    technologyName!:string;
}

export class ContactMassageResponseDto extends ContactMassageFields{}
export class CreateContactMassageRequestDto extends PickType(ContactMassageFields,['subject','phoneNumber','message']){
    @Expose({name:"phoneNumber"})
    phoneNumber!:string; 

}


export class SettingsResponseDto extends SettingsFields{}
export class CreateSettingsRequestDto extends PickType(SettingsFields,['companyName','logo','email','phoneNumber','companyAddress','facebook','whatsapp','instagram']){
    @Expose({name:"phoneNumber"})
    phoneNumber!:string;
    @Expose({name:"companyAddress"})
    companyAddress!:string;

}
export class SettingsRequestDto extends PickType(SettingsFields,['SettingId','companyName','logo','email','phoneNumber','companyAddress','facebook','whatsapp','instagram']){
    @Expose({name:"SettingId"})
    SettingId!:string;
    @Expose({name:"phoneNumber"})
    phoneNumber!:string;
    @Expose({name:"companyAddress"})
    companyAddress!:string;
}




// export class PostUpdatePublishedDto extends PickType(PostFields,['postId','published']){}