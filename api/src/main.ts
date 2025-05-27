import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Planning Poker API')
    .setDescription('API para el juego de Planning Poker')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  // Habilitar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // Iniciar el servidor
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Aplicación ejecutándose en: http://localhost:${port}`);
  console.log(`Documentación de la API: http://localhost:${port}/api`);
}

bootstrap();
