// Vercel Serverless Function: AI product recommendations with Gemini + local fallback
import type { VercelRequest, VercelResponse } from "@vercel/node"
import { GoogleGenerativeAI } from "@google/generative-ai"

type Product = {
  id: number
  name: string
  price: number
  category?: string
  brand?: string
  [key: string]: any
}

function extractBudgetFromQuery(text: string = ""): number | undefined {
  const match = String(text).match(/\b(\d{2,5})\b/)
  if (!match) return undefined
  return Number(match[1])
}

function normalize(str: string = ""): string {
  return String(str).toLowerCase()
}

function scoreProduct(product: Product, terms: string[]): number {
  const hay = normalize(`${product.name} ${product.brand ?? ""} ${product.category ?? ""}`)
  let score = 0
  for (const term of terms) {
    if (!term) continue
    if (hay.includes(term)) score += 2
    if ((product.category ?? "") === term) score += 3
    if (product.brand && normalize(product.brand) === term) score += 2
  }
  return score
}

function localRecommend(queryText: string, products: Product[]): Product[] {
  let terms = normalize(queryText)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
  const termSet = new Set(terms)
  if (termSet.has("iphone")) {
    termSet.add("apple")
    termSet.add("phone")
  }
  if (termSet.has("earbuds") || termSet.has("earbud")) termSet.add("headphones")
  if (termSet.has("tv")) termSet.add("television")
  terms = Array.from(termSet)

  const budget = extractBudgetFromQuery(queryText)
  let list = Array.isArray(products) ? products.slice() : []
  if (budget) {
    list = list.filter((p) => p.price <= budget)
  }
  list.sort((a, b) => scoreProduct(b as Product, terms) - scoreProduct(a as Product, terms))
  return list.slice(0, 10)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { query, products } = req.body || {}
  if (!query || !Array.isArray(products)) {
    return res.status(400).json({ error: "Missing query or products" })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    const recommended = localRecommend(String(query), products as Product[])
    return res.status(200).json({ recommendations: recommended })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `You are a product recommendation assistant.\nUser query: "${query}"\nAvailable products: ${JSON.stringify(
      products,
    )}\nReturn ONLY a JSON array of product IDs that best match the query, like: [2, 5, 9]. Limit to 3-5 IDs.`

    const result = await model.generateContent(prompt)
    const aiText = result.response.text()

    let recommendedIds: number[] = []
    try {
      recommendedIds = JSON.parse(aiText)
      if (!Array.isArray(recommendedIds)) recommendedIds = []
    } catch {
      const matches = aiText.match(/\d+/g)
      recommendedIds = matches ? matches.map(Number) : []
    }

    let recommended = (products as Product[]).filter((p) => recommendedIds.includes(p.id))
    if (recommended.length === 0) {
      recommended = localRecommend(String(query), products as Product[])
    }

    return res.status(200).json({ recommendations: recommended })
  } catch (err) {
    console.error("Gemini error:", err)
    const fallback = localRecommend(String(query), products as Product[])
    return res.status(200).json({ recommendations: fallback })
  }
}


