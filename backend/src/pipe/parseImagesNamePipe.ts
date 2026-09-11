import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";


@Injectable()
export class ParseImageNamePipe implements PipeTransform{
    transform(value: string, metadata: ArgumentMetadata) :string{
        const isValid = /^[0-9]{13}-[0-9]{9}\.(png|jpg)$/i.test(value)
        if(!isValid)
            throw new BadRequestException({message:"Invalid image input",code:"INVALID",statusCode:400});
        return value
    }

}