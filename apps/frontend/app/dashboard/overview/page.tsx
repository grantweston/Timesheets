import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Clock, DollarSign, BarChart, Calendar, LineChart, PlusCircle } from "lucide-react"
import { TimelineView } from "@/app/components/features/timeline/timeline-view"

// Add new component imports
import { WeeklySummaryChart } from "@/app/components/features/dashboard/weekly-summary-chart"
import { TimeDistribution } from "@/app/components/features/dashboard/time-distribution"
import { BillingMetrics } from "@/app/components/features/dashboard/billing-metrics"
import { QuickActions } from "@/app/components/features/dashboard/quick-actions"

export default function OverviewPage() {
  return (
    <main className="flex w-full flex-col gap-4 px-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <div className="flex items-center gap-2">
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="bg-transparent">
              <TabsTrigger 
                value="today"
                className="data-[state=active]:bg-transparent data-[state=active]:text-violet-600 data-[state=active]:underline data-[state=active]:underline-offset-4"
              >
                Today
              </TabsTrigger>
              <TabsTrigger 
                value="week"
                className="data-[state=active]:bg-transparent data-[state=active]:text-violet-600 data-[state=active]:underline data-[state=active]:underline-offset-4"
              >
                This Week
              </TabsTrigger>
              <TabsTrigger 
                value="month"
                className="data-[state=active]:bg-transparent data-[state=active]:text-violet-600 data-[state=active]:underline data-[state=active]:underline-offset-4"
              >
                This Month
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border-[#f5f2f9] dark:border-violet-900/10 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          <PlusCircle className="h-4 w-4 text-violet-500" />
        </CardHeader>
        <CardContent>
          <QuickActions />
        </CardContent>
      </Card>
    
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-[#f5f2f9] dark:border-violet-900/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
            <DollarSign className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">27.0h</div>
            <p className="text-xs text-muted-foreground">67% of total tracked time</p>
          </CardContent>
        </Card>
        <Card className="border-[#f5f2f9] dark:border-violet-900/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-Billable Hours</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10.0h</div>
            <p className="text-xs text-muted-foreground">24% of total tracked time</p>
          </CardContent>
        </Card>
        <Card className="border-[#f5f2f9] dark:border-violet-900/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-Work Hours</CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.5h</div>
            <p className="text-xs text-muted-foreground">9% of total tracked time</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Weekly Summary Chart */}
        <Card className="border-[#f5f2f9] dark:border-violet-900/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weekly Time Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklySummaryChart />
          </CardContent>
        </Card>

        {/* Distribution Chart */}
        <Card className="border-[#f5f2f9] dark:border-violet-900/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Time Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeDistribution />
          </CardContent>
        </Card>
      </div>

      {/* Billing Metrics */}
      <Card className="border-[#f5f2f9] dark:border-violet-900/10 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Billable Metrics</CardTitle>
          <LineChart className="h-4 w-4 text-violet-500" />
        </CardHeader>
        <CardContent>
          <BillingMetrics />
        </CardContent>
      </Card>

      {/* Timeline View */}
      <Card className="border-[#f5f2f9] dark:border-violet-900/10 shadow-sm px-4 py-4">
        <TimelineView />
      </Card>
    </main>
  )
}

