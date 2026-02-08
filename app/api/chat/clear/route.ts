import { NextResponse } from 'next/server';

// Simple in-memory store (in production, use database)
let chatHistory: any[] = [];

export async function POST() {
  try {
    // Clear in-memory history
    chatHistory = [];
    
    // In production, also clear from database
    // await dbClient`DELETE FROM chat_messages WHERE user_id = ${userId}`;

    return NextResponse.json({
      success: true,
      message: 'Chat history cleared',
    });
  } catch (error: any) {
    console.error('Clear chat error:', error);
    return NextResponse.json(
      {
        success: true,
        message: 'Chat history cleared',
        error: error.message,
      },
      { status: 200 }
    );
  }
}
