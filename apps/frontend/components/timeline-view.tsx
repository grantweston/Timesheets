import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function TimelineView() {
  const timeBlocks = [
    {
      id: 1,
      start: "9:00 AM",
      end: "10:30 AM",
      title: "Client Meeting - Project Review",
      client: "Acme Corp",
      billable: true,
    },
    {
      id: 2,
      start: "10:45 AM",
      end: "12:00 PM",
      title: "Documentation & Notes",
      client: "Acme Corp",
      billable: true,
    },
    {
      id: 3,
      start: "12:00 PM",
      end: "1:00 PM",
      title: "Lunch Break",
      billable: false,
    },
    {
      id: 4,
      start: "1:00 PM",
      end: "3:30 PM",
      title: "Development Work",
      client: "TechStart Inc",
      billable: true,
    },
  ]

  return (
    <div className="space-y-4">
      {timeBlocks.map((block) => (
        <Card key={block.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{block.title}</h3>
                <Badge variant={block.billable ? "default" : "secondary"}>
                  {block.billable ? "Billable" : "Non-Billable"}
                </Badge>
              </div>
              {block.client && <p className="text-sm text-muted-foreground">{block.client}</p>}
            </div>
            <div className="text-sm text-muted-foreground">
              {block.start} - {block.end}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

