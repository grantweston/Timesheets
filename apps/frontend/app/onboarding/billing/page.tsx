import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Switch } from "@/app/components/ui/switch"
import Link from "next/link"

export default function BillingPage() {
  return (
    <div className="animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Billing Preferences</CardTitle>
          <CardDescription>Set up your default billing and time tracking preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="increment">Minimum Time Increment</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select increment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minute</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="6">6 minutes (1/10 hour)</SelectItem>
                  <SelectItem value="15">15 minutes (1/4 hour)</SelectItem>
                  <SelectItem value="30">30 minutes (1/2 hour)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rounding">Time Rounding</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select rounding" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nearest">Round to nearest increment</SelectItem>
                  <SelectItem value="up">Always round up</SelectItem>
                  <SelectItem value="down">Always round down</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-start on Computer Login</Label>
                <div className="text-sm text-muted-foreground">Automatically start tracking when you log in</div>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Track Breaks Separately</Label>
                <div className="text-sm text-muted-foreground">Create separate time blocks for breaks</div>
              </div>
              <Switch />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="workHours">Working Hours</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input type="time" defaultValue="09:00" />
                <Input type="time" defaultValue="17:00" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

