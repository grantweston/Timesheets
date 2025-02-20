import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Card } from "@/app/components/ui/card"
import { Label } from "@/app/components/ui/label"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { Switch } from "@/app/components/ui/switch"
import { Separator } from "@/app/components/ui/separator"
import { Badge } from "@/app/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Bell, CreditCard, Globe, Lock, Mail, User, Zap } from "lucide-react"

export default function SettingsPage() {
  return (
    <main className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-violet-50/50 dark:bg-violet-900/10">
          <TabsTrigger 
            value="profile"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-violet-900/20 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-300"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="notifications"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-violet-900/20 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-300"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="billing"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-violet-900/20 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-300"
          >
            Billing
          </TabsTrigger>
          <TabsTrigger 
            value="integrations"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-violet-900/20 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-300"
          >
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-semibold">
                  JD
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    className="hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300"
                  >
                    Change Photo
                  </Button>
                </div>
              </div>

              <Separator className="bg-zinc-200 dark:bg-zinc-800" />

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    defaultValue="John Doe" 
                    className="border-zinc-200 dark:border-zinc-800 focus-visible:ring-violet-500"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue="john@example.com" 
                    className="border-zinc-200 dark:border-zinc-800 focus-visible:ring-violet-500"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="pst">
                    <SelectTrigger 
                      id="timezone"
                      className="border-zinc-200 dark:border-zinc-800 focus-visible:ring-violet-500"
                    >
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                      <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                      <SelectItem value="cst">Central Time (CST)</SelectItem>
                      <SelectItem value="est">Eastern Time (EST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25">
                Save Changes
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email updates about your activity.</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator className="bg-zinc-200 dark:bg-zinc-800" />

              <div className="space-y-4">
                <h3 className="font-medium">Notification Preferences</h3>
                <div className="grid gap-4">
                  {[
                    { icon: Bell, label: "Time tracking reminders" },
                    { icon: Mail, label: "Weekly summary" },
                    { icon: CreditCard, label: "Billing alerts" },
                    { icon: User, label: "Team mentions" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                        <span>{item.label}</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing">
          <Card className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Current Plan</h3>
                  <p className="text-sm text-muted-foreground">You are currently on the Pro plan.</p>
                </div>
                <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600">Pro Plan</Badge>
              </div>

              <Separator className="bg-zinc-200 dark:bg-zinc-800" />

              <div className="space-y-4">
                <h3 className="font-medium">Payment Method</h3>
                <div className="flex items-center gap-4">
                  <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-4 flex items-center gap-4">
                    <CreditCard className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/24</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300"
                  >
                    Update
                  </Button>
                </div>
              </div>

              <Separator className="bg-zinc-200 dark:bg-zinc-800" />

              <div className="space-y-4">
                <h3 className="font-medium">Billing History</h3>
                <div className="space-y-2">
                  {[
                    { date: "Feb 1, 2024", amount: "$29.00", status: "Paid" },
                    { date: "Jan 1, 2024", amount: "$29.00", status: "Paid" },
                  ].map((invoice) => (
                    <div key={invoice.date} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium">{invoice.date}</p>
                        <p className="text-sm text-muted-foreground">{invoice.amount}</p>
                      </div>
                      <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                        {invoice.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations">
          <Card className="p-6 space-y-6">
            <div className="space-y-4">
              {[
                {
                  icon: Globe,
                  name: "Jira",
                  description: "Link your Jira projects for automatic time tracking.",
                  connected: true,
                },
                {
                  icon: Lock,
                  name: "GitHub",
                  description: "Connect your repositories for development tracking.",
                  connected: true,
                },
                {
                  icon: Zap,
                  name: "Slack",
                  description: "Get notifications and track time directly from Slack.",
                  connected: false,
                },
              ].map((integration) => (
                <div key={integration.name} className="flex items-start justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-violet-100 dark:bg-violet-900/20 p-2">
                      <integration.icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">{integration.name}</h3>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  <Button 
                    variant={integration.connected ? "outline" : "default"}
                    className={integration.connected ? 
                      "hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300" :
                      "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25"
                    }
                  >
                    {integration.connected ? "Manage" : "Connect"}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
} 