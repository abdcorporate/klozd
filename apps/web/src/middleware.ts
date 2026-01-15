import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes publiques
  const publicRoutes = ['/login', '/register', '/pages/public', '/book'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Routes protégées
  const protectedRoutes = ['/dashboard', '/forms', '/leads', '/pages', '/sites', '/scheduling', '/settings', '/users', '/invitations'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Si route protégée, vérifier le cookie refreshToken
  if (isProtectedRoute && !isPublicRoute) {
    const refreshToken = request.cookies.get('refreshToken');

    if (!refreshToken) {
      // Pas de refresh token, rediriger vers login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Le refresh token existe, laisser passer
    // La vérification complète se fera côté client via /auth/me
  }

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


