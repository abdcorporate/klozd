import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Vérifier le token dans localStorage via cookie ou header
  // Note: localStorage n'est pas accessible dans middleware, on vérifie juste les routes
  const { pathname } = request.nextUrl;

  // Routes publiques
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Le middleware ne peut pas accéder à localStorage
  // La vérification d'authentification se fait côté client dans les pages
  // On laisse passer toutes les requêtes, la protection se fait dans les composants
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


