"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, Sparkles, Loader2 } from "lucide-react"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface SearchInputProps {
  onSearch: (query: string) => void
  onAIRecommendation: (products: any[]) => void
  products: any[]
}

export function SearchInput({ onSearch, onAIRecommendation, products }: SearchInputProps) {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = () => {
    onSearch(query)
  }

  const handleAIRecommendation = async () => {
    if (!query.trim()) return

    setIsLoading(true)

    try {
      const productList = products
        .map((p) => `${p.name} - $${p.price} - ${p.category} - ${p.brand} - ${p.description}`)
        .join("\n")

      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        system: `You are a product recommendation expert. Based on the user's query and the available products, recommend the most suitable products. 

Available products:
${productList}

Return your response as a JSON array of product IDs that match the user's requirements. Only include product IDs that exist in the product list. Format: [1, 2, 3]`,
        prompt: `User query: "${query}". Please recommend the best matching products from the available list.`,
      })

      // Parse the AI response to get product IDs
      const recommendedIds = JSON.parse(text.trim())
      const recommendedProducts = products.filter((p) => recommendedIds.includes(p.id))

      onAIRecommendation(recommendedProducts)
    } catch (error) {
      console.error("AI recommendation failed:", error)
      // Fallback to simple text search
      const fallbackResults = products
        .filter(
          (product) =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 3)
      onAIRecommendation(fallbackResults)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-card-foreground mb-2">Find Your Perfect Product</h2>
          <p className="text-muted-foreground">
            Search naturally or let AI recommend products based on your preferences
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="e.g., 'I want a phone under $500' or 'best laptop for work'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button onClick={handleSearch} variant="outline">
            Search
          </Button>
          <Button
            onClick={handleAIRecommendation}
            disabled={isLoading || !query.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            AI Recommend
          </Button>
        </div>
      </div>
    </Card>
  )
}
