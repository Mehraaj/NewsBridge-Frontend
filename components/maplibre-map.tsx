"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import type { SummarizedArticle } from "@/types/article.types"
import { CATEGORY_COLORS, getCategoryHex, getCategoryBadgeClass } from "@/lib/category-colors"

interface MapStats {
  totalArticles: number;
  articlesWithCoordinates: number;
  countriesCount: number;
  categoriesCount: number;
  clustersCount: number;
  articleCountsByCategory: Record<string, number>;
}

interface MapLibreMapProps {
  selectedCategory: string;
  searchQuery?: string;
  onStatsUpdate?: (stats: MapStats) => void;
}

export function MapLibreMap({ selectedCategory, searchQuery = "", onStatsUpdate }: MapLibreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isMapReady, setIsMapReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [allArticles, setAllArticles] = useState<SummarizedArticle[]>([])
  const [currentBounds, setCurrentBounds] = useState<any>(null)
  const [currentZoom, setCurrentZoom] = useState<number>(4)
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const popupTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const articleDataRef = useRef<{ [key: string]: SummarizedArticle }>({})

  // Debounce search query (similar to page.tsx)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Function to calculate and report statistics
  const calculateAndReportStats = (articles: SummarizedArticle[]) => {
    const articlesWithCoords = articles.filter(
      article => article.lat !== null && article.lng !== null
    );
    
    const countries = new Set(
      articlesWithCoords
        .map(article => article.location_name?.split(",").pop()?.trim())
        .filter(Boolean)
    );
    
    const categories = new Set(
      articles
        .map(article => article.category)
        .filter(Boolean)
    );

    // For stats, we'll estimate clusters based on zoom level
    // This is approximate since MapLibreGL handles clustering internally
    let estimatedClusters = articlesWithCoords.length;
    if (currentZoom < 6) {
      estimatedClusters = Math.ceil(articlesWithCoords.length / 5);
    } else if (currentZoom < 10) {
      estimatedClusters = Math.ceil(articlesWithCoords.length / 2);
    }

    const articleCountsByCategory: Record<string, number> = {};
    articles.forEach(article => {
      const category = (article.category || 'Unknown').toLowerCase();
      articleCountsByCategory[category] = (articleCountsByCategory[category] || 0) + 1;
    });

    const stats: MapStats = {
      totalArticles: articles.length,
      articlesWithCoordinates: articlesWithCoords.length,
      countriesCount: countries.size,
      categoriesCount: categories.size,
      clustersCount: estimatedClusters,
      articleCountsByCategory: articleCountsByCategory
    };

    console.log('MapLibreMap: Reporting stats:', stats);
    onStatsUpdate?.(stats);
  };

  // Function to clear popup with timeout
  const clearPopupWithTimeout = () => {
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
    }
    
    popupTimeoutRef.current = setTimeout(() => {
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    }, 300); // 300ms delay before removing popup
  };

  // Function to cancel popup timeout (when mouse enters popup or marker)
  const cancelPopupTimeout = () => {
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
      popupTimeoutRef.current = null;
    }
  };

  // Function to determine limit based on zoom level
  const getLimitForZoom = (zoom: number): number => {
    if (zoom <= 2) return 50;      // World view
    if (zoom <= 4) return 100;     // Continent view
    if (zoom <= 6) return 150;     // Country view
    if (zoom <= 8) return 200;     // State/region view
    return 300;                    // City view
  };

  // Function to fetch articles from backend with debouncing
  const fetchArticles = useCallback(async (bounds: any, zoom: number, search: string = "") => {
    setLoading(true)
    let newArticles: SummarizedArticle[] = [];
    
    try {
      const limit = getLimitForZoom(zoom);
      console.log('MapLibreMap: Fetching articles for bounds:', bounds, 'zoom:', zoom, 'limit:', limit, 'search:', search)
      
      const response = await fetch('/api/articles/map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bounds: {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
          },
          zoom,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: search || undefined, // Add search parameter
          limit,
          offset: 0
        }),
        credentials: 'include' // Add credentials like in page.tsx
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('MapLibreMap: Received articles:', data.articles?.length || 0)
      
      // Extract articles directly (no need to extract from clusters)
      newArticles = data.articles || [];
      
      console.log('MapLibreMap: Extracted articles:', newArticles.length)
      console.log("article titles", newArticles.map((article: SummarizedArticle) => article.title))
      
    } catch (error) {
      console.error('MapLibreMap: Error fetching articles:', error)
    } finally {
      setLoading(false)
    }

    // Always set new articles directly (clean slate approach)
    console.log('MapLibreMap: Setting fresh articles:', newArticles.length)
    setAllArticles(newArticles);
  }, [selectedCategory]);

  // Debounced fetch function with useCallback to prevent recreation
  const debouncedFetchArticles = useCallback((bounds: any, zoom: number, search: string = "") => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      fetchArticles(bounds, zoom, search);
    }, 500); // 500ms debounce delay
  }, [fetchArticles]);

  // Force immediate reload when category or search changes
  const forceReload = useCallback(() => {
    if (!map.current || !isMapReady) return;
    
    console.log('MapLibreMap: Force reloading due to category/search change');
    const bounds = map.current.getBounds();
    const zoom = map.current.getZoom();
    
    // Clear existing articles immediately
    setAllArticles([]);
    
    // Fetch new articles immediately (no debounce for category/search changes)
    fetchArticles(bounds, zoom, debouncedSearch);
  }, [isMapReady, fetchArticles, debouncedSearch]);

  // Function to create popup content for an article
  const createPopupContent = (article: SummarizedArticle): string => {
    const categoryColor = getCategoryHex(article.category || 'Unknown');
    
    const formatDate = (date: string | Date | null | undefined) => {
      if (!date) return "Unknown date";
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const imageUrl = article.image_url || '/placeholder.jpg';
    const title = article.title || 'No title available';
    const summary = article.summary || article.content || 'No summary available';
    const category = article.category || 'Unknown';
    const date = formatDate(article.published_at);
    const location = article.location_name || 'Unknown location';
    
    return `
      <div class="max-w-xs bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Image -->
        <div class="relative h-20 w-full">
          <img 
            src="${imageUrl}" 
            alt="${title}"
            class="w-full h-full object-cover"
            onerror="this.src='/placeholder.jpg'"
          />
        </div>
        
        <!-- Content -->
        <div class="p-3">
          <!-- Category Badge -->
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2 py-0.5 text-xs font-medium rounded-full ${getCategoryBadgeClass(article.category || 'Unknown')}">${article.category}</span>
            ${article.source ? `<span class="text-xs font-medium text-gray-600">${article.source}</span>` : ''}
          </div>
          
          <!-- Title -->
          <h3 class="font-semibold text-sm mb-1 line-clamp-2 text-gray-900">${title}</h3>
          
          <!-- Summary -->
          <p class="text-gray-600 text-xs mb-2 line-clamp-2">${summary}</p>
          
          <!-- Meta Info -->
          <div class="flex items-center gap-3 text-xs text-gray-500 mb-2">
            <div class="flex items-center gap-1">
              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>${date}</span>
            </div>
            <div class="flex items-center gap-1">
              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span>${location}</span>
            </div>
          </div>
          
          <!-- Read More Button -->
          <button 
            onclick="window.location.href='/article/${article.id}'"
            class="inline-flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors w-full cursor-pointer"
          >
            Read More
            <svg class="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  };

  // Function to add articles to the map
  const addArticlesToMap = () => {
    if (!map.current) return;

    console.log('MapLibreMap: Adding articles to map:', allArticles.length);

    // Remove existing layers and sources
    const layerIds = ['clusters', 'cluster-count', 'unclustered-point'];
    layerIds.forEach((layerId: string) => {
      if (map.current?.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });

    if (map.current?.getSource('articles')) {
      map.current.removeSource('articles');
    }

    // If no articles, just clear everything and return
    if (!allArticles.length) {
      console.log('MapLibreMap: No articles to display, map cleared');
      return;
    }

    // Filter articles with valid coordinates
    const validArticles = allArticles.filter(article => 
      article.lat !== null && article.lng !== null
    );

    // Store article data in ref for easy access (avoid serialization issues)
    articleDataRef.current = {};
    validArticles.forEach((article, index) => {
      const articleId = article.id || `article_${index}`;
      articleDataRef.current[articleId] = article;
    });

    // Create GeoJSON from individual articles
    const geojson = {
      type: 'FeatureCollection' as const,
      features: validArticles.map((article, index) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [article.lng!, article.lat!]
        },
        properties: {
          id: article.id || `article_${index}`,
          // Store minimal data to avoid serialization issues
          title: article.title || 'No title available',
          category: article.category || 'Unknown'
        }
      }))
    };

    console.log('MapLibreMap: Created GeoJSON with features:', geojson.features.length);
    console.log('MapLibreMap: Sample categories:', validArticles.slice(0, 5).map(a => ({ title: a.title, category: a.category })));
    console.log('MapLibreMap: GeoJSON sample features:', geojson.features.slice(0, 3).map(f => f.properties));

    // Add article source with clustering enabled
    map.current.addSource('articles', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    // Add cluster circles
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'articles',
      filter: ['has', 'point_count'], // Only show clusters
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6', 10,
          '#f1f075', 30,
          '#f28cb1'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20, 10,
          30, 30,
          40
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-opacity': 0.8
      }
    });

    // Add cluster count labels
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'articles',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': '#000000',
        'text-halo-width': 1
      }
    });

    // Add individual points (unclustered)
    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'articles',
      filter: ['!', ['has', 'point_count']], // Only show individual points
      paint: {
        'circle-radius': 8,
        'circle-color': [
          'case',
          ['==', ['downcase', ['get', 'category']], 'technology'], '#1e40af',
          ['==', ['downcase', ['get', 'category']], 'environment'], '#059669',
          ['==', ['downcase', ['get', 'category']], 'business'], '#7c3aed',
          ['==', ['downcase', ['get', 'category']], 'science'], '#ea580c',
          ['==', ['downcase', ['get', 'category']], 'sports'], '#dc2626',
          ['==', ['downcase', ['get', 'category']], 'entertainment'], '#db2777',
          ['==', ['downcase', ['get', 'category']], 'politics'], '#9333ea',
          ['==', ['downcase', ['get', 'category']], 'health'], '#16a34a',
          ['==', ['downcase', ['get', 'category']], 'education'], '#0891b2',
          ['==', ['downcase', ['get', 'category']], 'crime'], '#991b1b',
          ['==', ['downcase', ['get', 'category']], 'weather'], '#0284c7',
          ['==', ['downcase', ['get', 'category']], 'travel'], '#65a30d',
          '#6b7280' // Default gray color for unknown categories
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-opacity': 0.8
      }
    });
      
    console.log('MapLibreMap: Articles added successfully');

    // Force map update to ensure layers are properly rendered
    map.current.triggerRepaint();

    // Add interactions
    addMapInteractions();
  };

  // Add map interactions
  const addMapInteractions = () => {
    if (!map.current) return;

    // Check if layers exist before adding interactions
    const hasClusterLayer = map.current.getLayer('clusters');
    const hasIndividualLayer = map.current.getLayer('unclustered-point');
    
    if (!hasIndividualLayer && !hasClusterLayer) {
      console.log('MapLibreMap: No layers to add interactions to');
      return;
    }

    // Hover effects for clusters
    if (hasClusterLayer) {
      map.current.on('mouseenter', 'clusters', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'clusters', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });

      // Click handler for clusters - zoom into cluster
      map.current.on('click', 'clusters', (e) => {
        if (map.current && e.features && e.features.length > 0) {
          const features = map.current.queryRenderedFeatures(e.point, {
            layers: ['clusters']
          });
          
          if (features.length > 0) {
            const clusterId = features[0].properties?.cluster_id;
            const source = map.current.getSource('articles') as maplibregl.GeoJSONSource;
            
            if (source && source.getClusterExpansionZoom && clusterId !== undefined) {
              try {
                // MapLibreGL returns a Promise, not a callback
                const zoom = source.getClusterExpansionZoom(clusterId) as Promise<number>;
                zoom.then((expansionZoom: number) => {
                  if (map.current) {
                    map.current.easeTo({
                      center: (features[0].geometry as any).coordinates,
                      zoom: expansionZoom,
                      duration: 1000
                    });
                  }
                }).catch((error) => {
                  console.error('MapLibreMap: Error getting cluster expansion zoom:', error);
                });
              } catch (error) {
                console.error('MapLibreMap: Error with cluster expansion:', error);
              }
            }
          }
        }
      });
    }

    // Hover effects for individual markers
    if (hasIndividualLayer) {
      map.current.on('mouseenter', 'unclustered-point', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'unclustered-point', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });

      // Popup for individual articles
      map.current.on('mouseenter', 'unclustered-point', (e) => {
        console.log('MapLibreMap: Mouse enter individual marker', e.features);
        
        // Cancel any pending popup timeout
        cancelPopupTimeout();
        
        if (map.current && e.features && e.features.length > 0) {
          const feature = e.features[0];
          console.log("feature properties", feature.properties);
          
          // Get article data from ref using the ID
          const articleId = feature.properties?.id;
          const article = articleId ? articleDataRef.current[articleId] : null;
          
          console.log("popup for article", article?.title, "with ID", articleId);
          
          if (article) {
            // Remove existing popup
            if (popupRef.current) {
              popupRef.current.remove();
            }

            // Create new popup
            popupRef.current = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              maxWidth: '300px',
              offset: 10
            })
              .setLngLat((feature.geometry as any).coordinates)
              .setHTML(createPopupContent(article))
              .addTo(map.current);
            
            // Add event listeners to the popup element
            const popupElement = popupRef.current.getElement();
            if (popupElement) {
              // Keep popup open when mouse enters popup
              popupElement.addEventListener('mouseenter', () => {
                console.log('MapLibreMap: Mouse entered popup');
                cancelPopupTimeout();
              });
              
              // Start timeout when mouse leaves popup
              popupElement.addEventListener('mouseleave', () => {
                console.log('MapLibreMap: Mouse left popup');
                clearPopupWithTimeout();
              });
            }
            
            console.log('MapLibreMap: Popup created and added to map');
          } else {
            console.log('MapLibreMap: No article found for ID:', articleId);
          }
        }
      });

      map.current.on('mouseleave', 'unclustered-point', () => {
        // Start timeout to remove popup if mouse doesn't enter popup
        clearPopupWithTimeout();
      });

      // Click handler for individual markers
      map.current.on('click', 'unclustered-point', (e) => {
        console.log('MapLibreMap: Clicked individual marker', e.features);
        if (map.current && e.features && e.features.length > 0) {
          const feature = e.features[0];
          console.log('MapLibreMap: Clicked feature properties:', feature.properties);
          
          // Get article data from ref using the ID
          const articleId = feature.properties?.id;
          const article = articleId ? articleDataRef.current[articleId] : null;
          
          if (article) {
            console.log('MapLibreMap: Clicked article:', article.title);
          } else {
            console.log('MapLibreMap: No article found in clicked feature');
          }
        }
      });
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    console.log('MapLibreMap: useEffect for map initialization');
    if (!isClient || !mapContainer.current || map.current) {
      return;
    }

    console.log('MapLibreMap: Initializing map');

    try {
      // Initialize the map
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://api.maptiler.com/maps/streets/style.json?key=JHWHUFRHBZzWJlzYNUZC',
        center: [-77.0369, 38.9072], // Washington DC coordinates
        zoom: 4
      });

      console.log('MapLibreMap: Map instance created');

      // Add error handling
      map.current.on('error', (e) => {
        console.error('MapLibreMap: Map error:', e);
        if (e.error && e.error.message && e.error.message.includes('style')) {
          console.log('MapLibreMap: Trying fallback style');
          map.current?.setStyle('https://basemaps.cartocdn.com/gl/positron-gl-style/style.json');
        }
      });

      // Add navigation controls
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Add scale bar
      map.current.addControl(new maplibregl.ScaleControl({
        maxWidth: 80,
        unit: 'metric'
      }), 'bottom-left');

      // Set map as ready when it's fully loaded
      map.current.on('load', () => {
        console.log('MapLibreMap: Map fully loaded and ready');
        setIsMapReady(true);
      });

    } catch (error) {
      console.error('MapLibreMap: Error initializing map:', error);
    }

    return () => {
      console.log('MapLibreMap: Cleaning up map instance');
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      setIsMapReady(false);
    };
  }, [isClient]);

  // Add effect to fetch articles when map moves or category changes
  useEffect(() => {
    console.log('MapLibreMap: useEffect for fetch articles');
    if (!map.current || !isMapReady) {
      return;
    }

    const handleMoveEnd = () => {
      console.log('MapLibreMap: handleMoveEnd called');
      const bounds = map.current!.getBounds();
      const zoom = map.current!.getZoom();
      
      // Update bounds and zoom without causing re-render loop
      setCurrentBounds(bounds);
      setCurrentZoom(zoom);
      
      console.log('MapLibreMap: Calling debouncedFetchArticles');
      debouncedFetchArticles(bounds, zoom, debouncedSearch);
    };

    console.log('MapLibreMap: Adding event listeners');
    map.current.on('moveend', handleMoveEnd);
    map.current.on('zoomend', handleMoveEnd);

    // Initial fetch only if we don't have articles yet
    if (allArticles.length === 0) {
      console.log('MapLibreMap: Making initial fetch');
      handleMoveEnd();
    }

    return () => {
      console.log('MapLibreMap: Cleaning up event listeners');
      if (map.current) {
        map.current.off('moveend', handleMoveEnd);
        map.current.off('zoomend', handleMoveEnd);
      }
      // Clear any pending debounced calls
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      // Clear any pending popup timeouts
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    };
  }, [isMapReady, selectedCategory, debouncedFetchArticles, debouncedSearch]); // Added debouncedSearch dependency

  // Separate effect for updating map visualization when articles change
  useEffect(() => {
    if (!map.current || !isMapReady) return;
    
    console.log('MapLibreMap: Updating map visualization - zoom:', currentZoom, 'articles:', allArticles.length);
    
    // Update map visualization
    addArticlesToMap();
    calculateAndReportStats(allArticles);
  }, [allArticles, isMapReady]); // Removed currentZoom dependency to prevent loops

  // Effect to force reload when category or debounced search changes
  useEffect(() => {
    console.log('MapLibreMap: Category or search changed, force reloading');
    forceReload();
  }, [selectedCategory, debouncedSearch, forceReload]);

  if (!isClient) {
    return (
      <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="h-[600px] rounded-lg overflow-hidden border border-gray-200 relative">
      <div ref={mapContainer} style={{ height: "100%", width: "100%" }} />
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-3 py-2 rounded-md shadow-md z-10">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-700">Loading articles...</span>
          </div>
        </div>
      )}

      {/* Add CSS for popup styling */}
      <style jsx>{`
        .maplibregl-popup-content {
          padding: 12px;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
} 