import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { SummarizedArticle } from "@/types/article.types"
import { TrendingUp, AlertCircle, Heart, Frown, Meh } from "lucide-react"

interface ArticleSidebarProps {
  article: SummarizedArticle
}

export function ArticleSidebar({ article }: ArticleSidebarProps) {
  const getSentimentIcon = (sentiment: string | null) => {
    switch (sentiment) {
      case "positive":
        return <Heart className="h-4 w-4 text-green-600" />
      case "negative":
        return <Frown className="h-4 w-4 text-red-600" />
      case "neutral":
        return <Meh className="h-4 w-4 text-gray-600" />
      default:
        return <Meh className="h-4 w-4 text-gray-600" />
    }
  }

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800"
      case "negative":
        return "bg-red-100 text-red-800"
      case "neutral":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }


  const getFutureImplications = (future_implications: string | null) => {
    if (!future_implications) {
      console.log("No future implications found");
      return [];
    }
    return future_implications.split('\n').map((item, index) => (
      <li key={index} className="text-sm text-gray-700 leading-relaxed">{item}</li>
    ));
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Sentiment & Significance */}
      <Card className="h-[38rem] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {getSentimentIcon(article.sentiment)}
              <span className="font-medium text-sm">Sentiment</span>
            </div>
            <Badge className={getSentimentColor(article.sentiment)}>{article.sentiment || "Unknown"}</Badge>
          </div>

          {article.significance && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm">Significance</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{article.significance}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* What to Look Out For */}
      <Card className="h-[38rem] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            What to Watch
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {getFutureImplications(article.future_implications)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
