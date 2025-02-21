import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { InvoiceList } from "@/components/invoice-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

export default function InvoicesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 md:pt-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <DashboardNav />
        <main className="flex w-full flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          </div>
          <Tabs defaultValue="current" className="space-y-4">
            <TabsList>
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="archive">Archive</TabsTrigger>
            </TabsList>
            <TabsContent value="current" className="space-y-4">
              <Card className="p-6">
                <InvoiceList type="current" />
              </Card>
            </TabsContent>
            <TabsContent value="archive" className="space-y-4">
              <Card className="p-6">
                <InvoiceList type="archive" />
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

