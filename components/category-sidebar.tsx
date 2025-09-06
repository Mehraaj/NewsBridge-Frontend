"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Newspaper, Laptop, Leaf, Building2, Microscope, Globe, TrendingUp, Film, Cloud, Zap, Shield,} from "lucide-react"

interface CategorySidebarProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

const categories = [
  { id: "breaking-news", label: "Breaking News", icon: Newspaper, count: 24 },
  { id: "Technology", label: "Technology", icon: Laptop, count: 8 },
  { id: "Environment", label: "Environment", icon: Leaf, count: 5 },
  { id: "Business", label: "Business", icon: Building2, count: 7 },
  { id: "Science", label: "Science", icon: Microscope, count: 4 },
  { id: "Politics", label: "Politics", icon: Globe, count: 3 },
  { id: "Entertainment", label: "Entertainment", icon: Film, count: 2 },
  { id: "Sports", label: "Sports", icon: Zap, count: 1 },
  { id: "Crime", label: "Crime", icon: Shield, count: 1 },
  { id: "Weather", label: "Weather", icon: Cloud, count: 1 },
  { id: "Travel", label: "Travel", icon: Globe, count: 1 }, 
]

//Need to change this to tags 
const savedCategories = [
  { id: "breaking", label: "Breaking News", count: 3 },
  { id: "trending", label: "Trending", count: 12 },
  { id: "local", label: "Local News", count: 6 },
]

export function CategorySidebar({ selectedCategory, onCategoryChange }: CategorySidebarProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                className="w-full justify-between"
                onClick={() => onCategoryChange(category.id)}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{category.label}</span>
                </div>
                {/* <Badge variant="secondary" className="ml-auto">
                  {category.count}
                </Badge> */}
              </Button>
            )
          })}
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Saved Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {savedCategories.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              className="w-full justify-between"
              onClick={() => onCategoryChange(category.id)}
            >
              <span>{category.label}</span>
              <Badge variant="outline">{category.count}</Badge>
            </Button>
          ))}
        </CardContent>
      </Card> */}
    </div>
  )
}
