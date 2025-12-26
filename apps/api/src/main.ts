import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Helmet pour la sécurité (avec configuration pour permettre les requêtes API)
  app.use(
    helmet({
      contentSecurityPolicy: false, // Désactivé pour permettre les requêtes API
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger/OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('KLOZD API')
    .setDescription('API REST pour KLOZD - Plateforme tout-en-un pour infopreneurs et équipes de closing')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentification')
    .addTag('Forms', 'Gestion des formulaires')
    .addTag('Leads', 'Gestion des leads')
    .addTag('CRM', 'Rapports - Gestion du pipeline et des deals')
    .addTag('Scheduling', 'Planification des rendez-vous')
    .addTag('Dashboard', 'Tableaux de bord')
    .addTag('Teams', 'Gestion des équipes')
    .addTag('Users', 'Gestion des utilisateurs')
    .addTag('Exports', 'Export de données')
    .addTag('AI', 'Intelligence artificielle')
    .addTag('Calls', 'Visioconférence native')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'KLOZD API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 API KLOZD is running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
  console.log(`📝 Logs activés - Vérifie cette console pour les erreurs`);
}

bootstrap().catch((error) => {
  console.error('❌ Erreur au démarrage:', error);
  process.exit(1);
});
