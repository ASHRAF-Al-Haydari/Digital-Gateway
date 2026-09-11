import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy ,VerifyCallback} from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy,'google'){

    constructor(private  configService: ConfigService){
        // {
        //     // clientSecret: configService.get<string>("GOOGLE_CLINTE_SECRET") || process.env.GOOGLE_CLINTE_SECRET,
        //     // clientID:configService.get<string>("GOOGLE_CLINET_ID") || process.env.GOOGLE_CLINET_ID,
        //     // callbackURL: configService.get<string>("GOOGLE_CALL_BACK") || process.env.GOOGLE_CALL_BACK
        // }
        super({
            clientID:`${configService.get<string>("GOOGLE_CLINET_ID")}`,
            clientSecret: `${configService.get<string>("GOOGLE_CLINTE_SECRET")}`,
            callbackURL:`${configService.get<string>("GOOGLE_CALL_BACK")}`,
            scope:["profile","email"]
        });
    }

    validate(
    accessToken: string,
    refreshToken: string,
    profile: any){
        // console.log(profile)
    const { name, emails, photos,displayName,provider,id} = profile;
    const user = {
      googleId:id,
      email: emails[0].value,
      fullname:displayName,
      username: name.givenName + name.familyName,
      profileImage: photos[0].value,
      provider:provider
    };
    // done(null, user);
  return user
    }
}