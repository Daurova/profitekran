import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  // Если заходим в корень или в админку без токена — на логин
  if ((request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/admin')) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Если токен есть, но мы на логине — в админку
  if (token && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Если зашли в корень с токеном — в админку
  if (token && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/login'],
};