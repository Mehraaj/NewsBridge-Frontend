import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { IdentifiedArticle } from "@/types/article.types"
import { Clock, MapPin, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface ArticleCardProps {
  article: IdentifiedArticle
}

export function ArticleCard({ article }: ArticleCardProps) {
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Unknown date"
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case "Technology":
        return "bg-blue-100 text-blue-800"
      case "Environment":
        return "bg-green-100 text-green-800"
      case "Business":
        return "bg-purple-100 text-purple-800"
      case "Science":
        return "bg-orange-100 text-orange-800"
      case "Sports":
        return "bg-red-100 text-red-800"
      case "Entertainment":
        return "bg-pink-100 text-pink-800"
      case "Politics":
        return "bg-red-100 text-red-800"
      case "Health":
        return "bg-yellow-100 text-yellow-800"
      case "Education":
        return "bg-blue-100 text-blue-800"
      case "Crime":
        return "bg-red-100 text-red-800"
      case "Weather":
        return "bg-blue-100 text-blue-800"
      case "Travel":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Link href={`/article/${article.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={article.image_url || "/placeholder.svg"}
              alt={article.title || "Article image"}
              fill
              className="object-cover rounded-t-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.jpg';
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {article.category && <Badge className={getCategoryColor(article.category)}>{article.category}</Badge>}
            {article.source && <span className="text-sm font-medium text-gray-600">{article.source}</span>}
          </div>

          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{article.title}</h3>

          <p className="text-gray-600 text-sm mb-3 line-clamp-3">{article.content}</p>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            {article.author && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{article.author}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(article.published_at)}</span>
            </div>

            {article.location_name && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{article.location_name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
