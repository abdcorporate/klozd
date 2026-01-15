import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { CsrfService } from '../services/csrf.service';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private csrfService: CsrfService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const headerToken = request.headers['x-csrf-token'];
    const cookieToken = request.cookies?.csrfToken;

    if (!this.csrfService.validateToken(headerToken, cookieToken)) {
      throw new ForbiddenException('CSRF token invalide ou manquant');
    }

    return true;
  }
}
