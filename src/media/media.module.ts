import { Global, Module } from '@nestjs/common';
import { S3Module } from 'nestjs-s3';
import { S3Service } from '@src/media/services/s3.service';
import { S3Controller } from '@src/media/controllers/common/s3.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from '@src/media/models/file.model';
import { FileRepository } from '@src/media/repositories/file.repository';
import { FileExistsRule } from '@src/media/rules/file-exists.rule';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    S3Module.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          config: {
            accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
            region: configService.get('AWS_REGION'),
            signatureVersion: 'v4',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [S3Controller],
  providers: [S3Service, FileRepository, FileExistsRule],
  exports: [S3Service, FileRepository, FileExistsRule],
})
export class MediaModule {}
