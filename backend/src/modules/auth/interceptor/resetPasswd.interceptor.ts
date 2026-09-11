import { CallHandler, ExecutionContext, Module, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import * as express from 'express'
@Module({
    
})
export class ResetPasswordInterceptor implements NestInterceptor{
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        
        const request:express.Request = context.switchToHttp().getRequest()
        const user:any = request.user


        
        
        
        throw new Error("Method not implemented.");
    }
}