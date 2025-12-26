import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerAuthGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Si l'utilisateur est authentifié (déjà vérifié par JwtAuthGuard), on ignore le throttling
    if (request.user) {
      return true;
    }
    
    // Vérifier si un token JWT est présent dans les headers (même si pas encore validé)
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Si un token Bearer est présent, on ignore le throttling
      // (l'authentification sera vérifiée par JwtAuthGuard)
      return true;
    }
    
    // Sinon, on applique le throttling normal pour les endpoints publics
    return super.canActivate(context);
  }
}

