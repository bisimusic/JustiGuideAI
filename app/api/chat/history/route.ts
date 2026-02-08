import { NextResponse } from 'next/server';

// Simple in-memory store (in production, use database)
// This would be replaced with actual database queries
let chatHistory: any[] = [];

export async function GET() {
  try {
    // In production, fetch from database
    // For now, return in-memory history
    return NextResponse.json({
      success: true,
      messages: chatHistory.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date 
          ? msg.timestamp.toISOString() 
          : msg.timestamp,
      })),
    });
  } catch (error: any) {
    console.error('Chat history error:', error);
    return NextResponse.json(
      {
        success: true,
        messages: [],
        error: error.message,
      },
      { status: 200 }
    );
  }
}
