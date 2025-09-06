"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArticleSidebar } from "@/components/article-sidebar"
import type { SummarizedArticle } from "@/types/article.types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Clock, MapPin, User, ExternalLink, Loader2, FileText, Users, BookOpen } from "lucide-react"
import Image from "next/image"
import { getCategoryBadgeClass } from "@/lib/category-colors"

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<SummarizedArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const fetchArticle = async () => {
      if (!params.id) return

      console.log('useEffect triggered with params.id:', params.id)
      setLoading(true)
      setProgress(0)
      
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 80) {
            return prev + 2
          }
          return prev
        })
      }, 400)

      try {
        const response = await fetch(`/api/articles/${params.id}`, {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setArticle(data)
          setProgress(100) // Complete the progress bar
        } else {
          console.error("Article not found")
        }
      } catch (error) {
        console.error("Error fetching article:", error)
      } finally {
        clearInterval(progressInterval)
        setLoading(false)
      }
    }

    fetchArticle()
  }, [params.id])

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown date"
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "PERSON":
        return "👤"
      case "ORG":
        return "🏢"
      case "EVENT":
        return "📅"
      default:
        return "🏷️"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Button variant="ghost" onClick={() => router.push("/")} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to News
              </Button>

              <h1 className="text-xl font-semibold text-gray-900">NewsBridge</h1>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            {/* Spinning Loader */}
            <div className="flex justify-center mb-8">
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
            </div>

            {/* Message */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Summarizing Your Article
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              This may take a few minutes while our AI analyzes and summarizes the content for you.
            </p>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-8">
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-gray-500 mt-2">
                {progress < 80 ? "Preparing analysis..." : "Processing content..."}
              </p>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                <strong>What's happening:</strong> We're extracting the full article content, 
                analyzing key points, identifying important entities, and generating insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
          <p className="text-gray-600 mb-4">The article you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => router.push("/")} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to News
            </Button>

            <h1 className="text-xl font-semibold text-gray-900">NewsBridge</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="flex gap-8">
          {/* Main Article Content */}
          <main className="flex-1 max-w-4xl">
            <article className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Article Header */}
              <div className="p-8 pb-0">
                <div className="flex items-center gap-2 mb-4">
                  {article.category && <Badge className={getCategoryBadgeClass(article.category)}>{article.category}</Badge>}
                  {article.source && <span className="text-sm font-medium text-gray-600">{article.source}</span>}
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">{article.title}</h1>

                <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                  {article.author && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{article.author}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(article.published_at || null)}</span>
                  </div>

                  {article.location_name && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{article.location_name}</span>
                    </div>
                  )}
                </div>

                {article.image_url && (
                  <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
                    <Image
                      src={article.image_url || "/placeholder.svg"}
                      alt={article.title || "Article image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Tabbed Content */}
              <Tabs defaultValue="content" className="p-8">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Article
                  </TabsTrigger>
                  <TabsTrigger value="summary" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Summary
                  </TabsTrigger>
                  <TabsTrigger value="entities" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Key Entities
                  </TabsTrigger>
                </TabsList>

                {/* Article Content Tab */}
                <TabsContent value="content" className="mt-6 h-[32rem] overflow-y-auto">
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{article.content}</p>
                  </div>

                  {/* Source Link */}
                  {article.url && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <Button variant="outline" asChild>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Read Original Article
                        </a>
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Summary Tab */}
                <TabsContent value="summary" className="mt-6 h-[32rem] overflow-y-auto">
                  <p className="text-gray-700 leading-relaxed">{article.summary || "No summary available"}</p>
                </TabsContent>

                {/* Key Entities Tab */}
                <TabsContent value="entities" className="mt-6 h-[32rem] overflow-y-auto">
                  {article.entities && article.entities.length > 0 ? (
                    <div className="space-y-4">
                      {article.entities.map((entity, index) => (
                        <div key={index} className="border-l-4 border-blue-200 pl-4 pb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{getEntityIcon(entity.type)}</span>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">{entity.name}</h3>
                              <Badge variant="outline" className="text-sm">
                                {entity.type}
                              </Badge>
                            </div>
                          </div>

                          {entity.description && (
                            <p className="text-gray-600 mb-3 leading-relaxed">{entity.description}</p>
                          )}

                          {entity.wiki_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={entity.wiki_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Learn more
                              </a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No entities identified</p>
                  )}
                </TabsContent>
              </Tabs>
            </article>
          </main>

          {/* Sidebar */}
          <aside className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm h-[80rem]">
              <ArticleSidebar article={article} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
