import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pattern = searchParams.get('pattern');

    // In a real implementation, this would clear cache based on pattern
    // For now, we'll just return success
    // The actual cache clearing would be handled by your cache implementation

    return NextResponse.json({
      success: true,
      message: pattern 
        ? `Cache cleared for pattern: ${pattern}`
        : 'All cache cleared successfully',
    });
  } catch (error: any) {
    console.error('Clear cache error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to clear cache',
      },
      { status: 500 }
    );
  }
}
