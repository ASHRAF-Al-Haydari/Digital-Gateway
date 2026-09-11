import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {PrismaClient} from"../generated/prisma/client";
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import configuration from './configuration';

@Injectable()
export class PrismaService extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{

 constructor(){
   const adapter = new PrismaMariaDb(configuration());
  super({adapter})
 }


  /**
   * Connect to database when NestJS starts
   */
  async onModuleInit() {
    await this.$connect();
    await console.log(' Database connected successfully');
  }


  /**
   * Disconnect from database when application stops
   */
  async onModuleDestroy() {
    await this.$disconnect();
    await console.log(' Database disconnected');
  }

  // public ceateUser():<>

  // }

}