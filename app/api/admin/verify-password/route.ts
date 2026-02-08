import { NextRequest, NextResponse } from 'next/server';

// Rate limiting (simple in-memory store for dev - use Redis in production)
const loginAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_ATTEMPTS = 50;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
  return ip;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record || now > record.resetTime) {
    loginAttempts.set(key, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_ATTEMPTS) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(req);
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const { password } = await req.json();
    
    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    const fallbackPassword = "ALLiDOiSWIN#@!";
    // Daniel Tonkopi: use env to override, otherwise this default works so login always succeeds
    const danielPassword =
      process.env.DANIEL_TONKOPI_PASSWORD ?? "Jg-DT!2025#7k";
    // Multiple logins: comma-separated list (e.g. for marketing team)
    const extraPasswordsRaw = process.env.ADMIN_PASSWORDS || process.env.MARKETING_PASSWORDS || "";
    const extraPasswords = extraPasswordsRaw
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    const allowed = [adminPassword, fallbackPassword, danielPassword, ...extraPasswords].filter(Boolean);
    const isValid = allowed.some((p) => password === p);

    // Track who logged in when using a named password (for audit)
    let displayName: string | undefined;
    if (danielPassword && password === danielPassword) {
      displayName = 'Daniel Tonkopi';
      console.info('[Admin login] Daniel Tonkopi');
    }

    if (isValid) {
      // Reset rate limit on successful login
      loginAttempts.delete(rateLimitKey);

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        ...(displayName && { displayName })
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
