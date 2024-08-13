import { handleAuth } from '@kinde-oss/kinde-auth-nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { kindeAuth: string } }
) {
  const endpoint = params.kindeAuth
  try {
    const response = await handleAuth(request, endpoint)
    if (response instanceof Response) {
      return response
    } else if (typeof response === 'function') {
      const result = await response(request, {} as any)
      return new NextResponse(result.body, {
        status: result.status,
        headers: result.headers
      })
    } else {
      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
  }
}
