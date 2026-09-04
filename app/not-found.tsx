import { SearchX, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
            <SearchX className="size-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <CardTitle className="mt-4">Page not found</CardTitle>
          <CardDescription>The watch you’re looking for doesn’t exist or was moved.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-center gap-2">
          <Button asChild className="cursor-pointer gap-1.5"><Link href="/"><ArrowLeft className="size-4" />Back to home</Link></Button>
          <Button variant="outline" asChild className="cursor-pointer gap-1.5"><Link href="/overview"><Home className="size-4" />Dashboard</Link></Button>
        </CardContent>
      </Card>
    </div>
  )
}