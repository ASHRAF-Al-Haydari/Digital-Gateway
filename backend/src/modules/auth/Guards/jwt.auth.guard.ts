import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { UserRole } from "src/common/enum";
import { JwtPayloadType } from "src/utils/types";

@Injectable()
export class JwtGuard extends AuthGuard('jwt'){

    constructor(private reflector:Reflector){
        super();
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        
        if (!user ) {
        throw new UnauthorizedException({
            message: 'Authentication token is required',
            code: 'TOKEN_MISSING',
            statusCode: 401,
        });
        }

        if (info?.name === 'TokenExpiredError') {
            throw new UnauthorizedException({
            message: 'Access token has expired',
            code: 'TOKEN_EXPIRED', // Client can check this code to trigger refresh
            statusCode: 401,
        });
        }

        if (info?.name === 'JsonWebTokenError') {
            throw new UnauthorizedException({
                message: 'Invalid access token. Please log in again.',
                code: 'TOKEN_INVALID',
                statusCode: 401,
            });
        }

        if (info?.name === 'NotBeforeError') {
            throw new UnauthorizedException({
                message: 'Token is not active yet.',
                code: 'TOKEN_NOT_ACTIVE',
                statusCode: 401,
            });
        }

        if (err) {
        throw new UnauthorizedException({
            message: err.message || 'Authentication failed',
            code: 'AUTH_FAILED',
            statusCode: 401,
        });
        }

        // if(!user)
        //     throw new UnauthorizedException("unauthorize invalid token")
        const roles:UserRole[]= this.reflector.getAllAndOverride("roles",
                                [context.getHandler(),context.getClass()])
            
        if(!roles || roles.length==0)
            // throw new UnauthorizedException("invalid roles permissions")
            return user

        if(roles.includes(user.role))
            return user
        else
            throw new ForbiddenException({
            message:'You have not permission to access',
            code: 'PERMISSION_DENIED',
            statusCode: 403,
        });
    }
}