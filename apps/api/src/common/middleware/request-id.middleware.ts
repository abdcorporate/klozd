import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Générer ou récupérer le requestId
    const requestId = req.headers['x-request-id'] as string || uuidv4();

    // Attacher au request pour utilisation dans les controllers/services
    (req as any).requestId = requestId;
    // pino-http utilise req.id, donc on le définit aussi
    (req as any).id = requestId;

    // Écho dans la réponse
    res.setHeader('x-request-id', requestId);

    next();
  }
}
