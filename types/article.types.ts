export type IdentifiedArticle = {
  id: string
  source?: string | null
  title?: string | null
  url?: string | null
  image_url?: string | null
  published_at?: Date | null
  author?: string | null
  content?: string | null
  lat?: number | null
  lng?: number | null
  location_name?: string | null
  category?: string | null
}

export type SummarizedArticle = IdentifiedArticle & {
  summary: string | null
  significance: string | null
  sentiment: "positive" | "negative" | "neutral" | null
  entities: Entity[] | null
  future_implications: string | null
}

export type Entity = {
  name: string
  type: "PERSON" | "ORG" | "EVENT" | string
  description?: string | null
  wiki_url?: string | null
}

export type ArticleFilters = {
  category?: string
  language?: string
  country?: string
}
