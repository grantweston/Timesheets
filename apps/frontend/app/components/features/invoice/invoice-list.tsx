"use client"

import * as React from "react"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table"
import { cn } from "@/app/lib/utils"
import { customerMapping, CustomerName } from "@/app/lib/customer-mapping"
import { toast } from "sonner"

interface Invoice {
  id: string
  client: string
  amount: number
  hours: number
  status: "draft" | "sent" | "paid"
  date: string
}

interface InvoiceListProps {
  type: "current" | "archive"
}

export function InvoiceList({ type }: InvoiceListProps) {
  const [selectedClients, setSelectedClients] = React.useState<string[]>([])
  const [totalAmount, setTotalAmount] = React.useState(0)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [invoices, setInvoices] = React.useState<Invoice[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) =>
    type === "current" ? invoice.status !== "paid" : invoice.status === "paid"
  );

  const handleClientSelect = (client: string, checked: boolean) => {
    setSelectedClients((prev) => {
      const newSelection = checked ? [...prev, client] : prev.filter((c) => c !== client)

      // Calculate new total
      const newTotal = filteredInvoices
        .filter((invoice) => newSelection.includes(invoice.client))
        .reduce((sum, invoice) => sum + invoice.amount, 0)

      setTotalAmount(newTotal)
      return newSelection
    })
  }

  const handleGenerateInvoice = async () => {
    try {
      setIsGenerating(true);
      
      // For each selected client
      for (const client of selectedClients) {
        const invoice = filteredInvoices.find(inv => inv.client === client);
        if (!invoice) continue;

        const customerData = customerMapping[client as CustomerName];
        if (!customerData) {
          toast.error(`No customer mapping found for ${client}`);
          continue;
        }

        const response = await fetch('/api/invoices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(invoice.amount * 100), // Convert to cents
            description: `Invoice for ${invoice.hours} hours of work - ${invoice.date}`,
            customer: customerData.stripeId,
            quickbooksRealmId: process.env.NEXT_PUBLIC_QUICKBOOKS_REALM_ID,
            quickbooksAccessToken: 'YOUR_ACCESS_TOKEN' // You'll need to implement OAuth flow
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || 'Failed to generate invoice');
        }

        // Update the UI
        const data = await response.json();
        toast.success(`Invoice generated for ${client}`);
        console.log('Invoice generated:', data);
        
        // Refresh the invoice list
        await fetchInvoices();
      }

      // Clear selection
      setSelectedClients([]);
      setTotalAmount(0);
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate invoice');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading invoices...</div>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-violet-50/50 dark:hover:bg-violet-900/10">
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
          {filteredInvoices.map((invoice) => (
            <TableRow
              key={invoice.id}
              className={cn(
                "animate-fade-in transition-colors hover:bg-violet-50/50 dark:hover:bg-violet-900/10",
                selectedClients.includes(invoice.client) && "bg-violet-50 dark:bg-violet-900/20",
              )}
            >
              {type === "current" && (
                <TableCell>
                  <Checkbox
                    checked={selectedClients.includes(invoice.client)}
                    onCheckedChange={(checked) => handleClientSelect(invoice.client, checked as boolean)}
                    className="border-violet-200 dark:border-violet-800 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
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
                  className={cn(
                    invoice.status === "paid" && "bg-violet-600",
                    invoice.status === "sent" && "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
                    invoice.status === "draft" && "border-violet-200 text-violet-700 dark:border-violet-800 dark:text-violet-300"
                  )}
                >
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell>{invoice.date}</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300"
                  onClick={() => window.open(`https://dashboard.stripe.com/invoices/${invoice.id}`, '_blank')}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {type === "current" && selectedClients.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-violet-50/50 dark:bg-violet-900/10 rounded-lg animate-slide-up">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Selected Clients: {selectedClients.length}</p>
            <p className="text-lg font-medium">Total Amount: ${totalAmount.toFixed(2)}</p>
          </div>
          <Button 
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 transition-all hover:scale-105"
            onClick={handleGenerateInvoice}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Invoice'}
          </Button>
        </div>
      )}

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12 text-muted-foreground animate-fade-in">
          No {type === "current" ? "pending" : "archived"} invoices found.
        </div>
      )}
    </div>
  )
}

