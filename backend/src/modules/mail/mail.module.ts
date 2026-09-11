import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MailService } from "./mail.service";
import { CacheModule } from "@nestjs/cache-manager";
@Module({
    imports:[
        MailerModule.forRootAsync({
            inject:[ConfigService],
            imports:[ConfigModule],
            useFactory:(config:ConfigService)=>{
                return {
                    transport:{
                        host: config.get<string>('SMTP_HOST'),
                        port:config.get<number>('SMTP_PORT'),
                        secure:false,
                        auth:{
                            user:config.get<string>('SMTP_USERNAME'),
                            pass:config.get<string>('SMTP_PASSWORD')
                        }
                    }
                }
            }
        }),
    CacheModule.register()
    ]
    ,
    
    providers:[MailService],
    exports:[MailService]
})
export class MailModule{}