import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Block admin pages in production
  if (process.env.NODE_ENV === 'production') {
    const pathname = request.nextUrl.pathname;
    
    // Block all admin routes
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/404', request.url));
    }
    
    // Block all admin API routes
    if (pathname.startsWith('/api/admin')) {
      return new NextResponse('Not Found', { status: 404 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
