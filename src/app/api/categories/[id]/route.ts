import { NextResponse } from 'next/server'

const strapiUrl =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  'http://localhost:1337'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('================ UPDATE CATEGORY ================')

  try {
    const { id } = await params

    console.log('[1] Document ID:', id)

    const token = process.env.STRAPI_API_TOKEN

    console.log('[2] Token exists:', !!token)

    const body = await request.json()

    console.log('[3] Request body:', JSON.stringify(body, null, 2))

    const url = `${strapiUrl}/api/categories/${id}`

    console.log('[4] Sending request to:', url)

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })

    console.log('[5] Strapi response status:', response.status)

    const text = await response.text()

    console.log('[6] Raw Strapi response:')
    console.log(text)

    return new NextResponse(text, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('[ERROR]', error)

    return NextResponse.json(
      {
        error: 'Server Error',
        details: String(error)
      },
      { status: 500 }
    )
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const token = process.env.STRAPI_API_TOKEN

    const response = await fetch(
      `${strapiUrl}/api/categories/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.status === 204) {
    return new NextResponse(null, {
        status: 204
    })
    }

    const text = await response.text()

    return new NextResponse(text, {
    status: response.status,
    headers: {
        'Content-Type': 'application/json'
    }
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Delete failed',
        details: String(error)
      },
      { status: 500 }
    )
  }
}