import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

function getFallbackRecommendations(query: string, products: any[]): any[] {
  const queryLower = query.toLowerCase()
  const keywords = queryLower.split(" ").filter((word) => word.length > 2)

  // Score products based on keyword matches
  const scoredProducts = products.map((product) => {
    let score = 0
    const searchText = `${product.name} ${product.description} ${product.category} ${product.brand}`.toLowerCase()

    // Check for keyword matches
    keywords.forEach((keyword) => {
      if (searchText.includes(keyword)) {
        score += 1
      }
    })

    // Price-based scoring for budget queries
    if (
      queryLower.includes("under") ||
      queryLower.includes("below") ||
      queryLower.includes("cheap") ||
      queryLower.includes("budget")
    ) {
      const priceMatch = query.match(/\$?(\d+)/)
      if (priceMatch) {
        const budget = Number.parseInt(priceMatch[1])
        if (product.price <= budget) {
          score += 2
        }
      } else if (product.price < 500) {
        score += 1
      }
    }

    // Category-based scoring
    if (queryLower.includes("phone") && product.category.toLowerCase().includes("smartphone")) score += 3
    if (queryLower.includes("laptop") && product.category.toLowerCase().includes("laptop")) score += 3
    if (queryLower.includes("headphone") && product.category.toLowerCase().includes("headphone")) score += 3
    if (queryLower.includes("watch") && product.category.toLowerCase().includes("watch")) score += 3
    if (queryLower.includes("tablet") && product.category.toLowerCase().includes("tablet")) score += 3

    // Rating boost
    score += product.rating * 0.5

    return { ...product, score }
  })

  // Sort by score and return top 5
  return scoredProducts
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

export async function POST(request: NextRequest) {
  try {
    const { query, products } = await request.json()

    if (!query || !products) {
      return NextResponse.json({ error: "Missing query or products" }, { status: 400 })
    }

    try {
      const productList = products
        .map(
          (p: any) =>
            `ID: ${p.id}, Name: ${p.name}, Price: $${p.price}, Category: ${p.category}, Brand: ${p.brand}, Description: ${p.description}, Rating: ${p.rating}`,
        )
        .join("\n")

      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        system: `You are an expert product recommendation system. Analyze the user's query and recommend the most suitable products from the available inventory.

Available products:
${productList}

Instructions:
1. Understand the user's needs, preferences, and constraints (budget, category, features, etc.)
2. Match products based on relevance, value, and user requirements
3. Consider price-to-value ratio and product ratings
4. Return ONLY a JSON array of product IDs that best match the query
5. Limit recommendations to 3-5 products maximum
6. Only include product IDs that exist in the provided list

Example response format: [1, 3, 7]`,
        prompt: `User query: "${query}"\n\nPlease recommend the best matching products.`,
      })

      // Parse the AI response
      let recommendedIds: number[]
      try {
        recommendedIds = JSON.parse(text.trim())
      } catch (parseError) {
        // Fallback: extract numbers from the response
        const matches = text.match(/\d+/g)
        recommendedIds = matches ? matches.map(Number) : []
      }

      // Filter products based on recommended IDs
      const recommendedProducts = products.filter((p: any) => recommendedIds.includes(p.id))

      return NextResponse.json({
        recommendations: recommendedProducts,
        reasoning: `AI found ${recommendedProducts.length} products matching your criteria.`,
      })
    } catch (aiError: any) {
      console.log("[v0] AI API failed, using fallback recommendations:", aiError.message)

      const fallbackRecommendations = getFallbackRecommendations(query, products)

      return NextResponse.json({
        recommendations: fallbackRecommendations,
        reasoning: `Found ${fallbackRecommendations.length} products matching your criteria using smart filtering.`,
      })
    }
  } catch (error) {
    console.error("Recommendation API error:", error)
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}
