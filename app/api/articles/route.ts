import { NextResponse } from "next/server"
import type { IdentifiedArticle } from "@/types/article.types"
import axios from "axios"
// Dummy data for demonstration
const dummyArticles: IdentifiedArticle[] = [
  {
    id: "1",
    source: "TechCrunch",
    title: "AI Revolution: New Breakthrough in Machine Learning Transforms Healthcare",
    url: "https://example.com/ai-healthcare",
    image_url: "/placeholder.svg?height=200&width=400",
    published_at: new Date("2024-01-15T10:30:00Z"),
    author: "Sarah Johnson",
    content:
      "A groundbreaking advancement in artificial intelligence has emerged from researchers at Stanford University, promising to revolutionize healthcare diagnostics. The new machine learning model demonstrates unprecedented accuracy in early disease detection, particularly in oncology and cardiology. This breakthrough could potentially save millions of lives by enabling earlier intervention and more personalized treatment plans. The research team, led by Dr. Emily Chen, has developed an algorithm that can analyze medical imaging data with 95% accuracy, surpassing traditional diagnostic methods. The technology is expected to be implemented in major hospitals within the next two years, marking a significant milestone in the integration of AI in healthcare.",
    lat: 37.4419,
    lng: -122.143,
    location_name: "Stanford, CA",
    category: "technology",
  },
  {
    id: "2",
    source: "Reuters",
    title: "Global Climate Summit Reaches Historic Agreement on Carbon Emissions",
    url: "https://example.com/climate-summit",
    image_url: "/placeholder.svg?height=200&width=400",
    published_at: new Date("2024-01-15T08:15:00Z"),
    author: "Michael Rodriguez",
    content:
      "World leaders at the Global Climate Summit have reached a landmark agreement to reduce carbon emissions by 50% over the next decade. The agreement, signed by 195 countries, represents the most ambitious climate action plan in history. Key provisions include massive investments in renewable energy infrastructure, carbon capture technology, and sustainable transportation systems. The summit, held in Geneva, saw unprecedented cooperation between developed and developing nations. Environmental activists have praised the agreement as a crucial step toward limiting global warming to 1.5 degrees Celsius. Implementation will begin immediately, with quarterly progress reviews scheduled throughout the next decade.",
    lat: 46.2044,
    lng: 6.1432,
    location_name: "Geneva, Switzerland",
    category: "environment",
  },
  {
    id: "3",
    source: "Financial Times",
    title: "Major Tech Companies Report Record Q4 Earnings Despite Market Volatility",
    url: "https://example.com/tech-earnings",
    image_url: "/placeholder.svg?height=200&width=400",
    published_at: new Date("2024-01-15T06:45:00Z"),
    author: "David Kim",
    content:
      "Leading technology companies have announced exceptional fourth-quarter earnings, defying market predictions and economic uncertainty. Apple, Microsoft, and Google parent company Alphabet all exceeded analyst expectations, driven by strong demand for AI services and cloud computing solutions. The robust performance comes amid concerns about inflation and global economic slowdown. Apple reported a 12% increase in revenue, primarily attributed to iPhone sales and services growth. Microsoft's cloud division saw a 25% year-over-year increase, while Google's advertising revenue remained resilient despite market challenges. These results have boosted investor confidence in the technology sector's long-term prospects.",
    lat: 37.7749,
    lng: -122.4194,
    location_name: "San Francisco, CA",
    category: "business",
  },
  {
    id: "4",
    source: "BBC News",
    title: "Archaeological Discovery Reveals Ancient Civilization in Amazon Rainforest",
    url: "https://example.com/amazon-discovery",
    image_url: "/placeholder.svg?height=200&width=400",
    published_at: new Date("2024-01-15T05:20:00Z"),
    author: "Dr. Maria Santos",
    content:
      "Archaeologists have uncovered evidence of a previously unknown ancient civilization deep within the Amazon rainforest. The discovery, made using advanced LiDAR technology, reveals sophisticated urban planning and agricultural systems dating back over 1,000 years. The site spans approximately 50 square kilometers and includes complex irrigation networks, ceremonial structures, and residential areas. This finding challenges previous assumptions about pre-Columbian societies in the Amazon basin. The research team, led by international archaeologists, believes this civilization may have supported a population of over 100,000 people. The discovery provides new insights into sustainable land management practices that could inform modern conservation efforts.",
    lat: -3.4653,
    lng: -62.2159,
    location_name: "Amazon Basin, Brazil",
    category: "science",
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  let category = searchParams.get("category")
  let search = searchParams.get("search")
  const offset = searchParams.get("offset")
  const limit = searchParams.get("limit")
  let response;

  console.log('API Route - Request params:', { category, offset, limit })
  try {

    if (category === 'breaking-news') {
    console.log('API Route - Making request to backend:', `${process.env.NEXT_PUBLIC_API_URL}/articles/fresh?offset=${offset}&limit=${limit}`)
    response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/articles/fresh?offset=${offset}&limit=${limit}`, {
      withCredentials: true,
      data: {
        category: category === 'breaking-news' ? 'breaking-news' : category,
        sources: category === 'breaking-news' ? undefined : "bloomberg, the-wall-street-journal, reuters, abc-news, bbc-news, cnn, the-new-york-times",
        search: search ? search : undefined,

      }
    })
  }
  else{
    console.log('API Route - Making request to backend:', `${process.env.NEXT_PUBLIC_API_URL}/articles/db?offset=${offset}&limit=${limit}`)
    response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/articles/db?offset=${offset}&limit=${limit}`, {
      withCredentials: true,
      data: {
        category: category,
        search: search ? search : undefined,

      }
    })
  }
    
    console.log('API Route - Backend response status:', response.status)
    //console.log('API Route - Backend response data:', JSON.stringify(response.data, null, 2))
    
    const articles = response.data.articles
    const totalArticlesFound = response.data.total
    
    console.log('API Route - Extracted data:', {
      articlesCount: articles?.length,
      totalArticlesFound,
      hasArticles: !!articles,
      articlesType: typeof articles
    })

    const responseData = {
      articles: articles,
      totalArticlesFound,
    }
    //console.log('API Route - Final response data:', JSON.stringify(responseData, null, 2))
    
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("API Route - Error fetching fresh articles:", error)
    if (axios.isAxiosError(error)) {
      console.error("API Route - Axios error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
    }
    throw error // Re-throw to let Next.js handle the error
  }
}
