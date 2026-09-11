import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express'; 
import helmet from 'helmet';
import { doubleCsrf ,CsrfSecretRetriever} from 'csrf-csrf';
import * as express from 'express'
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
// const path =join(__dirname,'../..','images')

//   app.use(express.static(join(__dirname,'../..','images','profiles')))
// //  app.useStaticAssets(join(__dirname,'../..','images','profiles'))
// //  app.setViewEngine('ejs')
//   console.log(join(__dirname,'../..','images','profiles'))
app.use(helmet(
  // {
  //   // xPoweredBy:true
  //   hsts:{
  //     includeSubDomains:true,
  //     maxAge:31536000,
  //     preload:true
  //   }
  // } 
))
app.enableCors()
app.use(cookieParser.default(process.env.COOKIE_SECRET));
const {
    invalidCsrfTokenError,
    validateRequest,
    generateCsrfToken,
    doubleCsrfProtection
}=doubleCsrf({
  getSecret:(req)=> process.env.CSRF_SECRET_KEY! ,
  getSessionIdentifier:(req)=>"",
  cookieName:'X_CSRF_Token',
  cookieOptions:{
    maxAge:1000*60*60
  }
//req.headers['x-csrf-token'] || req.body.csrfToken
})

  app.useGlobalPipes(new ValidationPipe())
  
  const config = new DocumentBuilder()
  .setTitle('Digital-Gateway')
  .setDescription('The Digital-Gateway API description')
  .setVersion('1.0')
  .addTag('Digital-Gateway')
  .addBearerAuth({
    type:"http",
    scheme:"bearer",
    name:"JWT-Access-Token",
    bearerFormat:"JWT",
    description:"Enter your **Access Token** here (valid for 15m)",
    in:"header"
  },"access-token")
  // .addBearerAuth(
  //     {
  //       type: 'http',
  //       scheme: 'bearer',
  //       bearerFormat: 'JWT',
  //       name: 'JWT-Refresh-Token',
  //       description: 'Enter your **Refresh Token** here (valid for 7 days)',
  //       in: 'header',
  //     },
  //     'refresh-token', // 👈 Unique name for this scheme
  //   )

  .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory,{
    swaggerOptions:{
      persistAuthorization:true
    }
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
