import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt,Strategy } from "passport-jwt";
import { JwtConstant } from "../constants/jwt-constant";

@Injectable()
export default class JwtStrategy extends PassportStrategy(Strategy){
    constructor(){
        super({
            jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration:false,
            secretOrKey:process.env.JWT_SECRET_KEY as string,
        });
    }

    async validate(payload: any[]) {
        console.log("payload",payload)
        return payload
    }

}