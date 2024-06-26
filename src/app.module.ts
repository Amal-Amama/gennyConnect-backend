import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MaintenanceRequestsModule } from './maintenance-requests/maintenance-requests.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from './mailer/mailer.module';
import { UserModule } from './users/user.module';
//import { MulterModule } from '@nestjs/platform-express';
//import { ChatModule } from './chat/chat.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Chemin absolu vers le dossier 'uploads'
      serveRoot: '/uploads', // Racine URL pour servir les fichiers statiques
    }),
    // MulterModule.register({
    //   dest: './uploads',
    // }),
    MongooseModule.forRoot(process.env.DB_URI),
    MaintenanceRequestsModule,
    AuthModule,
    MailerModule,
    UserModule,
    //  ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
