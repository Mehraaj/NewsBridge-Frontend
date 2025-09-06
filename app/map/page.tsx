"use client"

import { useState, useEffect } from "react"
import { MapLibreMap } from "@/components/maplibre-map"
import { CategorySidebar } from "@/components/category-sidebar"
import { MapLegend } from "@/components/map-legend"
import type { SummarizedArticle } from "@/types/article.types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, RefreshCw, List, Globe } from "lucide-react"
import Link from "next/link"

interface MapStats {
  totalArticles: number;
  articlesWithCoordinates: number;
  countriesCount: number;
  categoriesCount: number;
  clustersCount: number;
  articleCountsByCategory: Record<string, number>;
}

export default function MapPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [mapStats, setMapStats] = useState<MapStats>({
    totalArticles: 0,
    articlesWithCoordinates: 0,
    countriesCount: 0,
    categoriesCount: 0,
    clustersCount: 0,
    articleCountsByCategory: {}
  })

  const handleCategoryChange = (category: string) => {
    // Convert category name to lowercase format
    let categoryParam = "all"
    if (category === "Breaking News") {
      categoryParam = "breaking-news"
    } else if (category !== "all") {
      categoryParam = category.charAt(0).toLowerCase() + category.slice(1)
    }
    setSelectedCategory(categoryParam)
  }

  const handleMapStatsUpdate = (stats: MapStats) => {
    console.log('MapPage: Received stats from map:', stats);
    setMapStats(stats);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">NewsBridge</h1>
              <span className="ml-2 text-sm text-gray-500">Global News Map</span>

              {/* View Toggle */}
              <div className="flex items-center gap-2 ml-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    List View
                  </Link>
                </Button>
                <Button variant="default" size="sm" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Map View
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <CategorySidebar selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedCategory === "all"
                  ? "Global News Map"
                  : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} News Map`}
              </h2>
              <div className="flex items-center gap-4 text-gray-600">
                <span>{mapStats.totalArticles} articles in view</span>
                <span>•</span>
                <span>{mapStats.articlesWithCoordinates} with location data</span>
              </div>
            </div>

            {/* Map Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Articles in View</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mapStats.totalArticles}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">With Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{mapStats.articlesWithCoordinates}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Countries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{mapStats.countriesCount}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{mapStats.categoriesCount}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Clusters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{mapStats.clustersCount}</div>
                </CardContent>
              </Card>
            </div>

            {/* Map Component */}
            <MapLibreMap 
              selectedCategory={selectedCategory} 
              onStatsUpdate={handleMapStatsUpdate}
              searchQuery={searchQuery}
            />

            {/* Map Legend - moved below map */}
            <div className="mt-6">
              <MapLegend articleCounts={mapStats.articleCountsByCategory} />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
