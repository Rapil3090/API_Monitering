import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { FileLogger } from './logger/file-logger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: new FileLogger() });
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}
bootstrap();
