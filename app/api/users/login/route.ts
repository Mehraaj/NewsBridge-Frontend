import { NextResponse } from "next/server"

export async function POST(request: Request) {
  console.log("Login API route called")
  try {
    const body = await request.json()
    console.log("Login request body:", { ...body, password: "[REDACTED]" })

    console.log("Making request to backend:", `${process.env.NEXT_PUBLIC_API_URL}/users/login`)
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      credentials: "include",
    })

    console.log("Backend response status:", response.status)
    const data = await response.json()
    console.log("Backend response data:", data)

    if (!response.ok) {
      console.log("Login failed:", data.error)
      return NextResponse.json(
        { error: data.error || "Login failed" },
        { status: response.status }
      )
    }

    // Forward the cookies from the backend response
    const headers = new Headers()
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        console.log("Setting cookie:", key)
        headers.append(key, value)
      }
    })

    console.log("Login successful, returning response")
    return NextResponse.json(data, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 