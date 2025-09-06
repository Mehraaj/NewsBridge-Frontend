import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

interface PaginationProps {
  currentPage: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  selectedCategory: string
  debouncedSearch: string
  hasNextPage: boolean
}

export function Pagination({ 
  currentPage, 
  onPageChange, 
  isLoading, 
  selectedCategory,
  debouncedSearch,
  hasNextPage
}: PaginationProps) {
  const queryClient = useQueryClient()
  console.log('rendering pagination')


  // Always show exactly 3 pages: previous, current, and next (if available)
  const getVisiblePages = () => {
    const pages = []
    
    // Previous page
    if (currentPage > 1) {
      pages.push(currentPage - 1)
    }
    
    // Current page
    pages.push(currentPage)
    
    // Next page (if has data)
    if (hasNextPage) {
      pages.push(currentPage + 1)
    }
    
    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {getVisiblePages().map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
          disabled={isLoading}
        >
          {page}
        </Button>
      ))}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage || isLoading}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
} 