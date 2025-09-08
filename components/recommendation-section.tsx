import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCard } from "./product-card"
import { Sparkles } from "lucide-react"

interface RecommendationSectionProps {
  recommendations: any[]
}

export function RecommendationSection({ recommendations }: RecommendationSectionProps) {
  if (recommendations.length === 0) return null

  return (
    <Card className="mb-8 bg-accent/5 border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent-foreground">
          <Sparkles className="h-5 w-5 text-accent" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
