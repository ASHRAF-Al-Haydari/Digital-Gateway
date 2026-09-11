import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";


@Injectable()
export class ParseCUUIDPipe implements PipeTransform{
    transform(value: string, metadata: ArgumentMetadata) :string{
        const isValid = /^c[a-z0-9]{24,}$/.test(value)
        if(!isValid)
            throw new BadRequestException({message:"Invalid id input",code:"INVALID",statusCode:400});
        return value
    }

}