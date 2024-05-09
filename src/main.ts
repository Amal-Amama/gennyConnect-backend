import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); //for using pipes globally in our routes
  app.use(
    cors({
      origin: 'http://localhost:3000', // Autoriser les requêtes depuis http://localhost:3000
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Méthodes HTTP autorisées
      allowedHeaders: ['Content-Type', 'Authorization'], // En-têtes autorisés
      preflightContinue: false,
      optionsSuccessStatus: 200,
    }),
  );
  await app.listen(5000);
}
bootstrap();
