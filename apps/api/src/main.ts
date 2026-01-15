import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure trust proxy for reverse proxy scenarios (Ingress NGINX / LoadBalancer)
  // TRUST_PROXY=true enables reading X-Forwarded-For and X-Real-IP headers
  const trustProxy = process.env.TRUST_PROXY === 'true';
  if (trustProxy) {
    // NestJS uses Express adapter by default, access Express instance
    const httpAdapter = app.getHttpAdapter();
    if (httpAdapter && typeof httpAdapter.getInstance === 'function') {
      const expressApp = httpAdapter.getInstance();
      expressApp.set('trust proxy', true);
    }
    console.log('✅ Trust proxy enabled - reading X-Forwarded-For and X-Real-IP headers');
  } else {
    console.log('⚠️ Trust proxy disabled - using direct connection IP');
  }

  // Helmet pour la sécurité (avec configuration pour permettre les requêtes API)
  app.use(
    helmet({
      contentSecurityPolicy: false, // Désactivé pour permettre les requêtes API
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Enable cookie parser
  app.use(cookieParser());

  // Enable CORS
  // Support multiple origins if CORS_ORIGINS is set (comma-separated)
  // Otherwise fallback to FRONTEND_URL or localhost
  // By default, include both web app (3000) and marketing app (3002) for development
  const defaultOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3002', // Marketing app
  ];
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : defaultOrigins;

  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true, // Important pour les cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-CSRF-Token'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Body size limits for public endpoints (applied globally, can be overridden per route)
  app.use((req, res, next) => {
    // Limit body size to 1MB for public endpoints
    if (req.path.startsWith('/forms/public') || req.path.startsWith('/leads/forms')) {
      const contentLength = parseInt(req.headers['content-length'] || '0', 10);
      if (contentLength > 1024 * 1024) {
        // 1MB limit
        return res.status(413).json({
          statusCode: 413,
          message: 'Request body too large. Maximum size is 1MB.',
        });
      }
    }
    next();
  });

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

  const port = Number(process.env.PORT) || 3001;
  const host = '0.0.0.0';
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  await app.listen(port, host);
  
  console.log(`🚀 API KLOZD is running on http://${host}:${port}`);
  console.log(`📚 API Documentation: http://${host}:${port}/api-docs`);
  console.log(`🌍 Environment: ${nodeEnv}`);
  console.log(`👷 Worker: ${process.env.RUN_WORKER === 'true' ? 'ENABLED' : 'DISABLED'} (BullMQ processors ${process.env.RUN_WORKER === 'true' ? 'will' : 'will NOT'} run)`);
  console.log(`⏰ Scheduler: ${process.env.RUN_SCHEDULER === 'true' ? 'ENABLED' : 'DISABLED'} (cron jobs ${process.env.RUN_SCHEDULER === 'true' ? 'will' : 'will NOT'} run)`);
  console.log(`📝 Logs activés - Vérifie cette console pour les erreurs`);
}

bootstrap().catch((error) => {
  console.error('❌ Erreur au démarrage:', error);
  process.exit(1);
});
