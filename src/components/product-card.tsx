import { Card, CardContent, CardFooter } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Star, ShoppingCart } from "lucide-react"

interface Product {
  id: number
  name: string
  price: number
  category: string
  brand: string
  image: string
  description: string
  rating: number
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border bg-card">
      <CardContent className="p-4">
        <div className="aspect-square relative mb-4 overflow-hidden rounded-md bg-muted">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div
            className="absolute top-2 right-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{
              backgroundColor: "#059669",
              color: "#ffffff",
              border: "none",
            }}
          >
            {product.category}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-card-foreground line-clamp-1">{product.name}</h3>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-muted-foreground">{product.rating}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">${product.price}</span>
            <Badge variant="outline" className="text-xs">
              {product.brand}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
