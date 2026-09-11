import { BadRequestException } from "@nestjs/common";
import { diskStorage, memoryStorage } from "multer";
import path from "path";

export function multerConfig(MaxFileSizeMB:number,MaxFilesCount:number,DestPath:string) {
            return{
     limits: {
                fileSize: MaxFileSizeMB * 1024 * 1024, // 3MB - Multer enforces this WHILE streaming
                files:MaxFilesCount
            },
            fileFilter: (req, file, cb) => {
                    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
                    if (allowed.includes(file.mimetype)) {
                        cb(null, true);
                    } else {
                        cb(new BadRequestException({
                            message:'Invalid file type',
                            code:"INVALID_FILE",
                            statusCode:400
                        }), false);
                    }
                    },
                storage:diskStorage({
                    destination:(req,file,cb)=>{
                        // console.log(file.fieldname)
                        // if(file.fieldname ==='projectImages')
                        
                        cb(null,`./images/${DestPath}`)
                        // console.log(file)
                        if(!req['filePath']){
                            req['filePath']=[]
                        }
                        req['filePath'].push(file.path)
                    },
                filename: (req, file, cb) => {
                // Optional: Generate a unique filename to avoid collisions
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = path.extname(file.originalname);
                cb(null, `${uniqueSuffix}${ext}`);
                // console.log(file)
                }
                })
    }
}