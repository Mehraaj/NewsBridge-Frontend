"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { IdentifiedArticle } from "@/types/article.types"
import { MapPin, Clock, User, ExternalLink } from "lucide-react"
import Link from "next/link"

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

interface NewsMapProps {
  articles: IdentifiedArticle[]
  selectedCategory: string
}

export function NewsMap({ articles, selectedCategory }: NewsMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [L, setL] = useState<any>(null)

  useEffect(() => {
    setIsClient(true)
    // Dynamically import Leaflet
    import("leaflet").then((leaflet) => {
      setL(leaflet.default)
    })
  }, [])

  // Filter articles that have coordinates
  const articlesWithCoordinates = articles.filter(
    (article) => article.lat !== null && article.lng !== null && article.lat !== undefined && article.lng !== undefined,
  )

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case "technology":
        return "bg-blue-100 text-blue-800"
      case "environment":
        return "bg-green-100 text-green-800"
      case "business":
        return "bg-purple-100 text-purple-800"
      case "science":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown date"
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const createCustomIcon = (category: string | null) => {
    if (!L) return null

    let color = "#6b7280" // default gray
    switch (category) {
      case "technology":
        color = "#3b82f6" // blue
        break
      case "environment":
        color = "#10b981" // green
        break
      case "business":
        color = "#8b5cf6" // purple
        break
      case "science":
        color = "#f59e0b" // orange
        break
    }

    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      className: "custom-marker",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })
  }

  if (!isClient || !L) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }

  if (articlesWithCoordinates.length === 0) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Location Data</h3>
            <p className="text-gray-500">No articles in this category have location information.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
      <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }} className="z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {articlesWithCoordinates.map((article) => (
          <Marker key={article.id} position={[article.lat!, article.lng!]} icon={createCustomIcon(article.category)}>
            <Popup maxWidth={300} className="custom-popup">
              <div className="p-2">
                <div className="flex items-center gap-2 mb-2">
                  {article.category && (
                    <Badge className={getCategoryColor(article.category)} variant="secondary">
                      {article.category}
                    </Badge>
                  )}
                  {article.source && <span className="text-xs font-medium text-gray-600">{article.source}</span>}
                </div>

                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{article.title}</h3>

                <p className="text-xs text-gray-600 mb-3 line-clamp-3">{article.content}</p>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
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
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild className="text-xs h-7">
                    <Link href={`/article/${article.id}`}>Read More</Link>
                  </Button>

                  {article.url && (
                    <Button size="sm" variant="ghost" asChild className="text-xs h-7">
                      <a href={article.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
