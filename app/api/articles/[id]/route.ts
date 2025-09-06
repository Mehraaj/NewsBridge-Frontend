import { NextResponse } from "next/server"
import type { SummarizedArticle, Entity } from "@/types/article.types"
import axios from "axios"
// Dummy entities data
const dummyEntities: Record<string, Entity[]> = {
  "1": [
    {
      name: "Dr. Emily Chen",
      type: "PERSON",
      description: "Lead researcher at Stanford University specializing in AI healthcare applications",
      wiki_url: "https://en.wikipedia.org/wiki/Emily_Chen",
    },
    {
      name: "Stanford University",
      type: "ORG",
      description: "Private research university in Stanford, California",
      wiki_url: "https://en.wikipedia.org/wiki/Stanford_University",
    },
    {
      name: "AI Healthcare Breakthrough",
      type: "EVENT",
      description: "Revolutionary machine learning advancement in medical diagnostics",
      wiki_url: null,
    },
  ],
  "2": [
    {
      name: "Global Climate Summit",
      type: "EVENT",
      description: "International conference on climate change and environmental policy",
      wiki_url: "https://en.wikipedia.org/wiki/Climate_summit",
    },
    {
      name: "Geneva",
      type: "ORG",
      description: "Host city for the climate summit in Switzerland",
      wiki_url: "https://en.wikipedia.org/wiki/Geneva",
    },
  ],
  "3": [
    {
      name: "Apple Inc.",
      type: "ORG",
      description: "American multinational technology company",
      wiki_url: "https://en.wikipedia.org/wiki/Apple_Inc.",
    },
    {
      name: "Microsoft Corporation",
      type: "ORG",
      description: "American multinational technology corporation",
      wiki_url: "https://en.wikipedia.org/wiki/Microsoft",
    },
    {
      name: "Alphabet Inc.",
      type: "ORG",
      description: "American multinational conglomerate and parent company of Google",
      wiki_url: "https://en.wikipedia.org/wiki/Alphabet_Inc.",
    },
  ],
  "4": [
    {
      name: "Dr. Maria Santos",
      type: "PERSON",
      description: "Lead archaeologist on the Amazon discovery project",
      wiki_url: null,
    },
    {
      name: "Amazon Rainforest",
      type: "ORG",
      description: "Large tropical rainforest in South America",
      wiki_url: "https://en.wikipedia.org/wiki/Amazon_rainforest",
    },
    {
      name: "LiDAR Technology",
      type: "EVENT",
      description: "Light Detection and Ranging technology used in archaeological surveys",
      wiki_url: "https://en.wikipedia.org/wiki/Lidar",
    },
  ],
}

// Dummy summarized articles
const dummySummarizedArticles: Record<string, SummarizedArticle> = {
  "1": {
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
    summary:
      "Stanford researchers have developed a revolutionary AI system for healthcare diagnostics with 95% accuracy in early disease detection. The breakthrough promises to transform oncology and cardiology through earlier intervention and personalized treatment plans, with hospital implementation expected within two years.",
    significance:
      "This represents a major milestone in AI-healthcare integration that could save millions of lives through improved early detection capabilities.",
    sentiment: "positive",
    entities: dummyEntities["1"],
  },
  "2": {
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
    summary:
      "195 countries signed a historic climate agreement to reduce carbon emissions by 50% over the next decade, featuring massive investments in renewable energy and unprecedented international cooperation.",
    significance:
      "This is the most ambitious climate action plan in history, crucial for limiting global warming to 1.5°C and preventing catastrophic climate change.",
    sentiment: "positive",
    entities: dummyEntities["2"],
  },
  "3": {
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
    summary:
      "Apple, Microsoft, and Alphabet exceeded Q4 earnings expectations despite market volatility, driven by AI services and cloud computing demand, boosting investor confidence in tech sector resilience.",
    significance:
      "Strong tech earnings demonstrate sector resilience and growing demand for AI/cloud services, potentially influencing broader market sentiment and investment strategies.",
    sentiment: "positive",
    entities: dummyEntities["3"],
  },
  "4": {
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
    summary:
      "LiDAR technology revealed a 1,000-year-old Amazon civilization spanning 50 sq km with sophisticated urban planning, challenging assumptions about pre-Columbian societies and offering insights for modern conservation.",
    significance:
      "This discovery revolutionizes understanding of Amazon history and provides valuable insights into sustainable land management that could inform current conservation efforts.",
    sentiment: "positive",
    entities: dummyEntities["4"],
  },
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params is properly awaited
    const { id } = await Promise.resolve(params);
    
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/articles/`, {
      withCredentials: true,
      data: {
        id: id,
      }
    });

    // Only return the data property of the axios response
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching article:', error);
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data?.message || 'Failed to fetch article' },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
