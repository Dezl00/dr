import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Cookie name must match session.ts
const SESSION_COOKIE_NAME = process.env.NODE_ENV === 'production'
  ? '__Host-session'
  : 'session'

// Reserved subdomains that are NOT tenant slugs
const RESERVED_SUBDOMAINS = new Set([
  'www', 'app', 'admin', 'api', 'mail',
  'cdn', 'assets', 'static', 'status',
])

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public assets (fonts, images)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|fonts/|images/).*)',
  ],
}

export default function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = (request.headers.get('host') || '').replace(/:\d+$/, '').toLowerCase()
  const rootDomain = 'beyoondgroup.com'
  const { pathname } = url

  // ─── Skip API routes (let them through directly) ───
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // ─── Determine if this is the root domain ───
  const isRootDomain =
    hostname === rootDomain ||
    hostname === `www.${rootDomain}` ||
    hostname === 'localhost'

  // ─── ROOT DOMAIN ROUTING ───
  if (isRootDomain) {
    // Protected routes: require session cookie
    if (pathname.startsWith('/dashboard')) {
      const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value
      if (!sessionToken) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
      }
      return NextResponse.next()
    }

    if (pathname.startsWith('/admin')) {
      const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value
      if (!sessionToken) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
      }
      return NextResponse.next()
    }

    // Auth routes: redirect if already authenticated
    if (pathname === '/login' || pathname === '/signup') {
      const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value
      if (sessionToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return NextResponse.next()
    }

    // All other root domain routes: marketing pages, etc.
    const res = NextResponse.next()
    res.headers.set('x-debug-hostname', hostname)
    res.headers.set('x-debug-is-root', 'true')
    return res
  }

  // ─── SUBDOMAIN / CUSTOM DOMAIN ROUTING ───
  // Extract subdomain if on platform domain
  let tenantIdentifier: string | null = null

  if (hostname.endsWith(`.${rootDomain}`)) {
    // Platform subdomain: e.g., alnoor-dental.platform.com
    const subdomain = hostname.replace(`.${rootDomain}`, '')

    // Skip reserved subdomains
    if (RESERVED_SUBDOMAINS.has(subdomain)) {
      return NextResponse.next()
    }

    tenantIdentifier = subdomain
  } else {
    // Custom domain: e.g., www.alnoorclinic.com
    tenantIdentifier = hostname
  }

  if (tenantIdentifier) {
    const tenantUrl = new URL(`/sites/${tenantIdentifier}${pathname}`, request.url)
    tenantUrl.search = url.search
    const res = NextResponse.rewrite(tenantUrl)
    res.headers.set('x-debug-hostname', hostname)
    res.headers.set('x-debug-tenant', tenantIdentifier)
    res.headers.set('x-debug-rewrite', tenantUrl.pathname)
    return res
  }

  const res = NextResponse.next()
  res.headers.set('x-debug-hostname', hostname)
  res.headers.set('x-debug-root', 'true')
  return res
}
