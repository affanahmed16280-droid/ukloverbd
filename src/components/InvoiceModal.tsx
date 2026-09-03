"use client";

import React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { Printer, X } from "lucide-react";
import { Product } from "@/app/page";

export type CartItem = Product & { quantity: number };

type InvoiceModalProps = {
  cart: CartItem[];
  total: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InvoiceModal({ cart, total, open, onOpenChange }: InvoiceModalProps) {
  const shippingFee = total > 5000 ? 0 : 100;
  const grandTotal = total + shippingFee;
  const invoiceId = React.useMemo(
    () => `UKBL-${Date.now().toString(36).toUpperCase()}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open]
  );
  const date = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric"
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card text-card-foreground print:shadow-none print:border-none print:fixed print:inset-0 print:max-w-full print:rounded-none print:z-50">
        <DialogHeader className="print:hidden">
          <DialogTitle className="text-xl font-semibold">Order Invoice</DialogTitle>
        </DialogHeader>

        <div className="p-4 print:p-8" id="printable-invoice">
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b border-border pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary" style={{ fontFamily: "var(--font-playfair)" }}>
                UK Brand Lover
              </h1>
              <p className="text-muted-foreground text-sm tracking-widest uppercase">London to Dhaka</p>
              <p className="text-sm mt-3">📞 WhatsApp: 01959-524393</p>
              <p className="text-sm">🌐 UKBRANDLOVER.COM</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Invoice</div>
              <h2 className="text-2xl font-bold text-foreground">#{invoiceId}</h2>
              <p className="text-sm text-muted-foreground mt-1">Date: {date}</p>
              <div className="mt-3 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium inline-block">
                Cash on Delivery
              </div>
            </div>
          </div>

          {/* Items Table */}
          <Table className="mb-6">
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-center w-16">Qty</TableHead>
                <TableHead className="text-right w-28">Unit Price</TableHead>
                <TableHead className="text-right w-28">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">৳{item.price.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-semibold">৳{(item.price * item.quantity).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2 bg-muted/50 rounded-xl p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>৳{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className={shippingFee === 0 ? "text-green-600 dark:text-green-400 font-medium" : ""}>
                  {shippingFee === 0 ? "✓ FREE (Dhaka)" : `৳${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between font-bold border-t border-border pt-3 text-xl">
                <span>Grand Total</span>
                <span className="text-primary">৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 text-center text-sm text-muted-foreground border-t border-border pt-6 space-y-1">
            <p className="font-medium text-foreground">Thank you for choosing UK Brand Lover! 🇬🇧</p>
            <p>100% Authentic British Imports • Hand-carried from London to Dhaka</p>
            <p>Free delivery in Dhaka on orders over ৳5,000</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-2 print:hidden">
          <p className="text-xs text-muted-foreground">
            {cart.length} item{cart.length !== 1 ? "s" : ""} • 
            {shippingFee === 0 ? " Free delivery" : " ৳100 delivery"}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-1" /> Close
            </Button>
            <Button
              onClick={() => window.print()}
              className="gap-2"
            >
              <Printer className="w-4 h-4" /> Print A4
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
