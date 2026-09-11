import { BadRequestException, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import {ConfigModule} from '@nestjs/config'
import { MailModule } from './modules/mail/mail.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'path';
import { AdminModule } from './admin/admin.module';
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal:true,
      envFilePath:".env"
    }),
    MailModule,

    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
