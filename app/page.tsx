"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ArticleCard } from "@/components/article-card"
import { CategorySidebar } from "@/components/category-sidebar"
import { Pagination } from "@/components/pagination"
import type { SummarizedArticle } from "@/types/article.types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw, List, Globe } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ArticlesResponse {
  articles: SummarizedArticle[]
  totalArticlesFound: number
}

const ITEMS_PER_PAGE = 6

async function fetchArticles(
  category: string,
  page: number,
  search: string
): Promise<ArticlesResponse> {
  const offset = (page - 1) * ITEMS_PER_PAGE
  const url = `/api/articles?category=${category}&offset=${offset}&limit=${ITEMS_PER_PAGE}&search=${encodeURIComponent(search)}`
  //console.log('Fetching from URL:', url);
  
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      Cookie: `sessionToken=${localStorage.getItem('sessionToken') || ''}`
    }
  })
  //console.log("fetched")
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      errorText,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries())
    });
    throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json()
  //console.log('API Response:', data);
  return data
}

export default function HomePage() {
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState("breaking-news")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [hasNextPage, setHasNextPage] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1) // Reset to first page on search
      
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const router = useRouter()
  // Main query for current page
  const { data, isLoading, isError, error } = useQuery<ArticlesResponse, Error>({
    queryKey: ['articles', selectedCategory, currentPage, debouncedSearch],
    queryFn: () => fetchArticles(selectedCategory, currentPage, debouncedSearch),
    staleTime: 1000 * 60,
  })

  useEffect(() => {
    // Check if we have a session token
    console.log("sessionToken in checkAuth", localStorage.getItem('sessionToken'))
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/users/me", {
          credentials: "include",
          headers: {
            Cookie: `sessionToken=${localStorage.getItem('sessionToken') || ''}`
          }
        })
        
        if (!response.ok) {
          console.log("Invalid response,", response)
          console.log("Redirecting to login")
          // If not authenticated, redirect to login
          router.push("/login")
          return
        }
        
        // If authenticated, redirect to the news page
        router.push("/")
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/login")
      }
    }

    //checkAuth()
  }, [router])

  useEffect(() => {

    // taking advantage of the finally block which always runs, for clean up. Storing function in a variable to call it later
    const prefetch = async () => {
      // Do not need this because onClick of the pagination button will set the state to true, causing this useEffect to run 
      // setPaginationLoading(true);
  
      try {
        await queryClient.prefetchQuery({
          queryKey: ['articles', selectedCategory, currentPage + 1, debouncedSearch],
          queryFn: () => {
            console.log("prefetching page", currentPage + 1);
            return fetchArticles(selectedCategory, currentPage + 1, debouncedSearch);
          },
        });
        const nextPageData = queryClient.getQueryData<ArticlesResponse>(['articles', selectedCategory, currentPage + 1, debouncedSearch])
        setHasNextPage(Boolean(nextPageData?.articles?.length))

      } finally {
        //setPaginationLoading(false);
      }
    };
  
    prefetch();
  }, [currentPage, selectedCategory, debouncedSearch, queryClient]);
  

  const handleCategoryChange = (category: string) => {
    if (category === "Breaking News") {
      setSelectedCategory("breaking-news")
    } else {
      setSelectedCategory(category)
    }
    setCurrentPage(1)
  }

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['articles'] })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const articles = data?.articles || []
  console.log ('articles', articles);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">NewsBridge</h1>
              <span className="ml-2 text-sm text-gray-500">Intelligent News Analysis</span>
            </div>

            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <Button variant="default" size="sm" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  List View
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/map" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Map View
                  </Link>
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
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
                {selectedCategory === "breaking-news"
                  ? "Breaking News"
                  : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} News`}
              </h2>
              <p className="text-gray-600">
                {isLoading ? (
                  <span className="animate-pulse">Loading articles...</span>
                ) : (
                  <>
                    Articles Found - Happy Reading!
                    {debouncedSearch && ` matching "${debouncedSearch}"`}
                  </>
                )}
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                    <div className="bg-white p-4 rounded-b-lg">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <p className="text-red-500 text-lg">Error loading articles</p>
                <Button onClick={handleRefresh} variant="outline" className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[600px]">
                  {articles.map((article: SummarizedArticle) => (
                    <ArticleCard 
                      key={article.id} 
                      article={article} 
                    />
                  ))}
                </div>

                {articles.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                    selectedCategory={selectedCategory}
                    debouncedSearch={debouncedSearch}
                    hasNextPage={hasNextPage}
                  />
                )}
              </>
            )}

            {!isLoading && articles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No articles found</p>
                <p className="text-gray-400">Try adjusting your search or category filter</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
