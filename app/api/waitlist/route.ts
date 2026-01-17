import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, immigrationStatus } = body

    // TODO: Connect to your database/storage service
    // For now, just return success
    // Example:
    // await storage.addToWaitlist({ name, email, phone, immigrationStatus })

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully joined waitlist' 
    })
  } catch (error: any) {
    console.error('Waitlist error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}
