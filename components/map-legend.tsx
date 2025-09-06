import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/category-colors"

interface MapLegendProps {
  articleCounts: Record<string, number>
}

export function MapLegend({ articleCounts }: MapLegendProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4" />
          Map Legend
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Dual column grid */}
        <div className="grid grid-cols-2 gap-3">
          {CATEGORY_COLORS.map((category) => (
            <div key={category.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
                  style={{ backgroundColor: category.hex }}
                />
                <span className="text-sm font-medium">{category.label}</span>
              </div>
              <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-800 border px-2.5 py-0.5 text-xs font-semibold">
                {articleCounts[category.id] || 0}
              </span>
            </div>
          ))}
        </div>

        {/* Show any additional categories not in our predefined list */}
        {Object.keys(articleCounts).filter(cat => !CATEGORY_COLORS.find(c => c.id.toLowerCase() === cat.toLowerCase())).length > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Other Categories:</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(articleCounts)
                .filter(cat => !CATEGORY_COLORS.find(c => c.id.toLowerCase() === cat.toLowerCase()))
                .map((category) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
                        style={{ backgroundColor: DEFAULT_CATEGORY_COLOR.hex }}
                      />
                      <span className="text-sm font-medium capitalize">{category}</span>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-800 border px-2.5 py-0.5 text-xs font-semibold">
                      {articleCounts[category]}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">Click on map pins to view article details</p>
        </div>
      </CardContent>
    </Card>
  )
}
