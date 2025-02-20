import { ProjectList } from "@/components/project-list"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"

export default function WIPPage() {
  return (
    <main className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Work in Progress</h1>
        <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25">
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Search clients or projects..." 
          className="pl-9 border-zinc-200 dark:border-zinc-800 focus-visible:ring-violet-500"
        />
      </div>
      <Card className="p-6 border-zinc-200 dark:border-zinc-800">
        <ProjectList />
      </Card>
    </main>
  )
}

