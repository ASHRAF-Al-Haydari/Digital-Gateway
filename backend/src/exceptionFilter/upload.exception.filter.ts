import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, InternalServerErrorException } from "@nestjs/common";
import { unlink } from "fs/promises";
import * as express from 'express'

@Catch(HttpException)
export class UploadFilesExceptionFilter implements ExceptionFilter{
    catch(exception: HttpException, host: ArgumentsHost) {
        // console.log(exception)
        // throw  exception
        const request:express.Request = host.switchToHttp().getRequest()
        if(exception.name=='BadRequestException' && exception.message === 'Unexpected field - projects')
            throw new BadRequestException({
                    message:'Invalid files count',
                    code:"LIMIT_FILE_COUNT",
                    statusCode:400
                });

            //remove files if their data not stored in database
            if(request['filePath'])
            {
                for(const file of request['filePath'])
                unlink(file)
                .catch((e)=>{})
                .finally(()=>{
                    request['filePath']=undefined;
                    });
            }
            
            throw exception
        
    }



}