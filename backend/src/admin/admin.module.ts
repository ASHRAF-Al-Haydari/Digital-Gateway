import { BadRequestException, Module } from "@nestjs/common";
import { AdminDashboard } from "./admin.controller";
import { AdminDashboardService } from "./admin.service";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import path from "path";
@Module({
    controllers:[
        AdminDashboard,
    ],
    providers:[AdminDashboardService],
})
export class AdminModule{}