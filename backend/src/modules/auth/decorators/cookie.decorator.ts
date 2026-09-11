import { createParamDecorator, ExecutionContext  } from "@nestjs/common";


export const Cookie = createParamDecorator(
    async (data:String,ctx : ExecutionContext)=>{
        const request = await ctx.switchToHttp().getRequest()
        const refreshToken = request.cookies[`${data}`]
        // console.log("cookies ",refreshToken)
        return refreshToken
    }
)