import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // field di luar DTO otomatis dibuang
      forbidNonWhitelisted: true, // field asing bikin error
      transform: true, // otomatis konversi tipe data (string -> number)
    }),
  );
  await app.listen(process.env.PORT ?? 8003);
}
bootstrap();
