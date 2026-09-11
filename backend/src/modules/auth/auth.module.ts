import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {JwtModule} from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import JwtStrategy from './strategy/jwt-strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { AuthProvider } from './auth.provider';
import { CacheModule } from '@nestjs/cache-manager';
import { MailModule } from '../mail/mail.module';

@Module({
  imports:[
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory:async (configService:ConfigService)=>({
        global:true,
        secret:configService.get<string>('JWT_SECRET_KEY'),
        signOptions:{expiresIn :configService.get<number>('JWT_EXPIRE')}
      }),
      inject:[ConfigService]
    }),
    PassportModule,
    CacheModule.register(),
    MailModule
  ],
  controllers: [AuthController],
  providers: [AuthService ,JwtStrategy,GoogleStrategy,AuthProvider],
  exports: [AuthService]
})
export class AuthModule {}
