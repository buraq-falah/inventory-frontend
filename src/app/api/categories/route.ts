import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
const categoriesEndpoint = `${strapiUrl}/api/categories`
const categoriesQuery = `${categoriesEndpoint}?fields=name,description`

async function resolveAuthHeaders(request: Request): Promise<HeadersInit | NextResponse> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }

  const incomingAuth = request.headers.get('Authorization')

  if (incomingAuth) {
    headers.Authorization = incomingAuth
    return headers
  }

  const session = await getServerSession(authOptions)

  if (session?.jwt) {
    headers.Authorization = `Bearer ${session.jwt}`
    return headers
  }

  if (process.env.STRAPI_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.STRAPI_API_TOKEN}`
    return headers
  }

  return NextResponse.json(
    { error: 'No Strapi auth token available. Sign in, set STRAPI_API_TOKEN, or pass Authorization header.' },
    { status: 401 }
  )
}

export async function GET(request: Request) {
  try {
    const headers = await resolveAuthHeaders(request)

    if (headers instanceof NextResponse) {
      return headers
    }

    const response = await fetch(categoriesQuery, {
      headers,
      next: { revalidate: 10 }
    })

    if (!response.ok) {
      const message = await response.text()
      return NextResponse.json(
        { error: 'Failed to fetch categories', details: message },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to fetch categories', details: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const headers = await resolveAuthHeaders(request)

    if (headers instanceof NextResponse) {
      return headers
    }

    const payload = await request.json()
    const response = await fetch(categoriesEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const message = await response.text()
      return NextResponse.json(
        { error: 'Failed to create category', details: message },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to create category', details: String(error) },
      { status: 500 }
    )
  }
}
