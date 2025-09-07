import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Get the cookie 'sessionToken' from the incoming request
    const cookie = localStorage.getItem('sessionToken')
    console.log("In me route, incoming cookie header:", cookie)
    console.log("In me route, process.env.NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL)
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/current-session`, {
      method: "GET",
      credentials: "include",
      headers: {
        // Forward the cookie header exactly as received
        Cookie: cookie || ''
      },
    })
    console.log("Checking response from me route")
    console.log("Response from me route:", response)
    if (!response.ok) {
      console.log("Session check failed:", response.status)
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      )
    }

    const data = await response.json()
    console.log("Session check successful:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 