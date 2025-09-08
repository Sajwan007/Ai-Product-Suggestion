"use client"

import { useState } from "react"
import { ProductCard } from "@/components/product-card"
import { SearchInput } from "@/components/search-input"
import { RecommendationSection } from "@/components/recommendation-section"
import { FilterSidebar } from "@/components/filter-sidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

// Sample product data
const products = [
  {
    id: 1,
    name: "iPhone 14",
    price: 799,
    category: "smartphones",
    brand: "Apple",
    image: "/iphone-14-smartphone.png",
    description: "Latest iPhone with advanced camera system and A16 Bionic chip",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Samsung Galaxy S23",
    price: 699,
    category: "smartphones",
    brand: "Samsung",
    image: "/images/phone-1.png",
    description: "Flagship Android phone with exceptional display and performance",
    rating: 4.7,
  },
  {
    id: 3,
    name: "Google Pixel 7",
    price: 449,
    category: "smartphones",
    brand: "Google",
    image: "/google-pixel-7-smartphone.jpg",
    description: "Pure Android experience with incredible computational photography",
    rating: 4.6,
  },
  {
    id: 4,
    name: "MacBook Air M2",
    price: 1199,
    category: "laptops",
    brand: "Apple",
    image: "/macbook-air-m2-laptop.jpg",
    description: "Ultra-thin laptop with M2 chip and all-day battery life",
    rating: 4.9,
  },
  {
    id: 5,
    name: "Dell XPS 13",
    price: 999,
    category: "laptops",
    brand: "Dell",
    image: "/dell-xps-13-laptop.jpg",
    description: "Premium ultrabook with InfinityEdge display",
    rating: 4.5,
  },
  {
    id: 6,
    name: "Sony WH-1000XM5",
    price: 349,
    category: "headphones",
    brand: "Sony",
    image: "/sony-wh-1000xm5.png",
    description: "Industry-leading noise canceling wireless headphones",
    rating: 4.8,
  },
  {
    id: 7,
    name: "AirPods Pro 2",
    price: 249,
    category: "headphones",
    brand: "Apple",
    image: "/airpods-pro-2-earbuds.jpg",
    description: "Active noise cancellation with spatial audio",
    rating: 4.7,
  },
  {
    id: 8,
    name: "iPad Pro 12.9",
    price: 1099,
    category: "tablets",
    brand: "Apple",
    image: "/ipad-pro-12-9-tablet.jpg",
    description: "Most advanced iPad with M2 chip and Liquid Retina XDR display",
    rating: 4.8,
  },
]

export default function ProductRecommendationSystem() {
  const [filteredProducts, setFilteredProducts] = useState(products)
  const [recommendations, setRecommendations] = useState([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    priceRange: [0, 2000],
    minRating: 0,
  })

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredProducts(products)
      setRecommendations([])
      return
    }

    // Simple text-based filtering for demo
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase()),
    )

    setFilteredProducts(filtered)
  }

  const handleAIRecommendation = (recommendedProducts: any[]) => {
    setRecommendations(recommendedProducts)
  }

  const applyFilters = (newFilters: any) => {
    setFilters(newFilters)

    const filtered = products.filter((product) => {
      const matchesCategory = !newFilters.category || product.category === newFilters.category
      const matchesBrand = !newFilters.brand || product.brand === newFilters.brand
      const matchesPrice = product.price >= newFilters.priceRange[0] && product.price <= newFilters.priceRange[1]
      const matchesRating = product.rating >= newFilters.minRating

      return matchesCategory && matchesBrand && matchesPrice && matchesRating
    })

    setFilteredProducts(filtered)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">AI Product Finder</h1>
            <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(!isFilterOpen)} className="md:hidden">
              <Menu className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <SearchInput onSearch={handleSearch} onAIRecommendation={handleAIRecommendation} products={products} />
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && <RecommendationSection recommendations={recommendations} />}

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <div className={`${isFilterOpen ? "block" : "hidden"} md:block`}>
            <FilterSidebar filters={filters} onFiltersChange={applyFilters} products={products} />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Products ({filteredProducts.length})</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
                <p className="text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
