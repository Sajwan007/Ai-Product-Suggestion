"use client"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Slider } from "./ui/slider"
import { Button } from "./ui/button"

interface FilterSidebarProps {
  filters: {
    category: string
    brand: string
    priceRange: number[]
    minRating: number
  }
  onFiltersChange: (filters: any) => void
  products: any[]
}

export function FilterSidebar({ filters, onFiltersChange, products }: FilterSidebarProps) {
  const categories = [...new Set(products.map((p) => p.category))]
  const brands = [...new Set(products.map((p) => p.brand))]

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      category: "",
      brand: "",
      priceRange: [0, 2000],
      minRating: 0,
    })
  }

  return (
    <Card className="w-80 bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="text-card-foreground">Category</Label>
          <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Brand Filter */}
        <div className="space-y-2">
          <Label className="text-card-foreground">Brand</Label>
          <Select value={filters.brand} onValueChange={(value) => updateFilter("brand", value)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder="All brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label className="text-card-foreground">
            Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </Label>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => updateFilter("priceRange", value)}
            max={2000}
            min={0}
            step={50}
            className="w-full"
          />
        </div>

        {/* Rating Filter */}
        <div className="space-y-2">
          <Label className="text-card-foreground">Minimum Rating: {filters.minRating}+</Label>
          <Slider
            value={[filters.minRating]}
            onValueChange={(value) => updateFilter("minRating", value[0])}
            max={5}
            min={0}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Clear Filters */}
        <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
          Clear All Filters
        </Button>
      </CardContent>
    </Card>
  )
}
