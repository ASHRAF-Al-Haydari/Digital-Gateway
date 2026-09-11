import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable, tap } from "rxjs";

@Injectable()
export default class TreyInterceptor implements NestInterceptor{
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        const request = context.switchToHttp().getRequest()
     console.log("before intercept.")
     console.log("request:",request.headers)
     const time=  Date.now()

     return next.handle().pipe(tap(()=>console.log(`After... ${Date.now() - time}ms`)),
        map((data)=>{
            return{ status:"Success",data:data}
        })
     );
    }
    
}