import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAuthenticated } from '@/lib/auth-server'
  
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const loggedIn = await isAuthenticated()
  if (!loggedIn) {
    return NextResponse.redirect(new URL(`/sign-in?next=${pathname}`, request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/app/:path*',
}