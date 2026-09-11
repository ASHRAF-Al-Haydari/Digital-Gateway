import { ApiProperty } from "@nestjs/swagger";

export class ImageDto{
      @ApiProperty({ type: 'file', format: 'binary',name:"Profile_Image",readOnly:true})
      image:any;
}