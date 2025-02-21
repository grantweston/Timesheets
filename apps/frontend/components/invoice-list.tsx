"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface Invoice {
  id: string
  client: string
  amount: number
  hours: number
  status: "draft" | "sent" | "paid"
  date: string
}

const mockInvoices: Invoice[] = [
  {
    id: "INV-001",
    client: "Acme Corp",
    amount: 1200.0,
    hours: 8,
    status: "draft",
    date: "2024-02-18",
  },
  {
    id: "INV-002",
    client: "TechStart Inc",
    amount: 2400.0,
    hours: 16,
    status: "sent",
    date: "2024-02-17",
  },
  {
    id: "INV-003",
    client: "Global Solutions",
    amount: 900.0,
    hours: 6,
    status: "paid",
    date: "2024-02-16",
  },
]

interface InvoiceListProps {
  type: "current" | "archive"
}

export function InvoiceList({ type }: InvoiceListProps) {
  const [selectedClients, setSelectedClients] = React.useState<string[]>([])
  const [totalAmount, setTotalAmount] = React.useState(0)

  const invoices = mockInvoices.filter((invoice) =>
    type === "current" ? invoice.status !== "paid" : invoice.status === "paid",
  )

  const handleClientSelect = (client: string, checked: boolean) => {
    setSelectedClients((prev) => {
      const newSelection = checked ? [...prev, client] : prev.filter((c) => c !== client)

      // Calculate new total
      const newTotal = invoices
        .filter((invoice) => newSelection.includes(invoice.client))
        .reduce((sum, invoice) => sum + invoice.amount, 0)

      setTotalAmount(newTotal)
      return newSelection
    })
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            {type === "current" && (
              <TableHead className="w-12">
                <span className="sr-only">Select</span>
              </TableHead>
            )}
            <TableHead>Invoice</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow
              key={invoice.id}
              className={cn(
                "animate-fade-in transition-colors",
                selectedClients.includes(invoice.client) && "bg-primary/5",
              )}
            >
              {type === "current" && (
                <TableCell>
                  <Checkbox
                    checked={selectedClients.includes(invoice.client)}
                    onCheckedChange={(checked) => handleClientSelect(invoice.client, checked as boolean)}
                  />
                </TableCell>
              )}
              <TableCell>{invoice.id}</TableCell>
              <TableCell>{invoice.client}</TableCell>
              <TableCell>{invoice.hours}</TableCell>
              <TableCell>${invoice.amount.toFixed(2)}</TableCell>
              <TableCell>
                <Badge
                  variant={invoice.status === "paid" ? "default" : invoice.status === "sent" ? "secondary" : "outline"}
                >
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell>{invoice.date}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {type === "current" && selectedClients.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg animate-slide-up">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Selected Clients: {selectedClients.length}</p>
            <p className="text-lg font-medium">Total Amount: ${totalAmount.toFixed(2)}</p>
          </div>
          <Button className="transition-all hover:scale-105">Generate Invoice</Button>
        </div>
      )}

      {invoices.length === 0 && (
        <div className="text-center py-12 text-muted-foreground animate-fade-in">
          No {type === "current" ? "pending" : "archived"} invoices found.
        </div>
      )}
    </div>
  )
}

