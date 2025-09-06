import { NextResponse } from "next/server"
import axios from "axios"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bounds, zoom, category, search, limit = 50 } = body

    console.log('Map API Route - Received clustering request:', { bounds, zoom, category, search, limit })

    // Call the backend clustering endpoint
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/articles/map`,
      {
        bounds,
        zoom,
        category,
        search,
        limit
      },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('Map API Route - Backend response status:', response.status)
    console.log('Map API Route - Backend response data:', {
      articlesCount: response.data.articles?.length,
      totalArticles: response.data.total
    })

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("Map API Route - Error calling backend:", error)
    if (axios.isAxiosError(error)) {
      console.error("Map API Route - Axios error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
    }
    
    // Return empty response on error
    return NextResponse.json({
      articles: [],
      total: 0
    })
  }
} 