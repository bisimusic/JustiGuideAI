import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return empty array for now - A/B tests can be implemented later
    // This prevents the constant reload issue
    const abTests: any[] = [];

    return NextResponse.json(abTests);
  } catch (error: any) {
    console.error('AB tests error:', error);
    return NextResponse.json([], { status: 200 });
  }
}
