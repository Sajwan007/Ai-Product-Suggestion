// Lightweight Express API to provide Gemini-powered recommendations with local fallback
import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import { GoogleGenerativeAI } from "@google/generative-ai"

dotenv.config()

const app = express()
app.use(cors())
app.use(bodyParser.json())

// --- Local recommendation helpers (ported from aizip/backend) ---
function extractBudgetFromQuery(text = "") {
  const match = String(text).match(/\b(\d{2,5})\b/)
  if (!match) return undefined
  return Number(match[1])
}

function normalize(str = "") {
  return String(str).toLowerCase()
}

function scoreProduct(p, terms) {
  const hay = normalize(`${p.name} ${p.brand ?? ""} ${p.category ?? ""}`)
  let score = 0
  for (const t of terms) {
    if (!t) continue
    if (hay.includes(t)) score += 2
    if ((p.category ?? "") === t) score += 3
    if (p.brand && normalize(p.brand) === t) score += 2
  }
  return score
}

function localRecommend(queryText, products) {
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
  list.sort((a, b) => scoreProduct(b, terms) - scoreProduct(a, terms))
  return list.slice(0, 10)
}

const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY)
const genAI = hasGeminiKey ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

app.post("/api/recommend", async (req, res) => {
  const { query, products } = req.body || {}
  if (!query || !Array.isArray(products)) {
    return res.status(400).json({ error: "Missing query or products" })
  }

  // If no key, go straight to local
  if (!hasGeminiKey) {
    const recommended = localRecommend(query, products)
    return res.json({ recommendations: recommended })
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const prompt = `You are a product recommendation assistant.\nUser query: "${query}"\nAvailable products: ${JSON.stringify(
      products,
    )}\nReturn ONLY a JSON array of product IDs that best match the query, like: [2, 5, 9]. Limit to 3-5 IDs.`

    const result = await model.generateContent(prompt)
    const aiText = result.response.text()

    let recommendedIds = []
    try {
      recommendedIds = JSON.parse(aiText)
      if (!Array.isArray(recommendedIds)) recommendedIds = []
    } catch {
      const matches = aiText.match(/\d+/g)
      recommendedIds = matches ? matches.map(Number) : []
    }

    let recommended = products.filter((p) => recommendedIds.includes(p.id))
    if (recommended.length === 0) {
      recommended = localRecommend(query, products)
    }

    res.json({ recommendations: recommended })
  } catch (err) {
    console.error("Gemini error:", err)
    const fallback = localRecommend(query, products)
    res.json({ recommendations: fallback })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`)
})


