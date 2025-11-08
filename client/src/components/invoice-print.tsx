import { forwardRef } from "react";

interface InvoiceItem {
  productName: string;
  quantity: number;
  rate: number;
  gstRate: string;
  amount: number;
}

interface InvoicePrintProps {
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerGst?: string;
  paymentMode: string;
  items: InvoiceItem[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  invoiceType: "b2c" | "b2b";
}

export const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(
  ({ invoiceNumber, customerName, customerPhone, customerGst, paymentMode, items, subtotal, gstAmount, totalAmount, invoiceType }, ref) => {
    const currentDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <div ref={ref} className="p-8 bg-white text-black print:p-0">
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page { size: A4; margin: 1cm; }
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              .no-print { display: none !important; }
            }
          `
        }} />
        
        <div className="max-w-4xl mx-auto border-2 border-black p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">AMAZEON SHOPPING</h1>
            <p className="text-sm">Complete Billing Solution</p>
            <div className="mt-4 pt-4 border-t-2 border-black">
              <p className="text-xl font-bold">{invoiceType === "b2c" ? "TAX INVOICE (B2C)" : "TAX INVOICE (B2B)"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <p className="text-sm font-bold mb-2">INVOICE DETAILS:</p>
              <p className="text-sm">Invoice No: <span className="font-bold">{invoiceNumber}</span></p>
              <p className="text-sm">Date: {currentDate}</p>
              <p className="text-sm">Payment Mode: <span className="uppercase font-semibold">{paymentMode}</span></p>
            </div>
            <div>
              <p className="text-sm font-bold mb-2">CUSTOMER DETAILS:</p>
              <p className="text-sm">Name: {customerName}</p>
              <p className="text-sm">Phone: {customerPhone}</p>
              {customerGst && <p className="text-sm">GST No: {customerGst}</p>}
            </div>
          </div>

          <table className="w-full border-2 border-black mb-6">
            <thead>
              <tr className="bg-black text-white">
                <th className="border border-white p-2 text-left text-sm">Sr.</th>
                <th className="border border-white p-2 text-left text-sm">Product Name</th>
                <th className="border border-white p-2 text-right text-sm">Qty</th>
                <th className="border border-white p-2 text-right text-sm">Rate</th>
                <th className="border border-white p-2 text-right text-sm">GST%</th>
                <th className="border border-white p-2 text-right text-sm">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-black">
                  <td className="border-r border-black p-2 text-sm">{index + 1}</td>
                  <td className="border-r border-black p-2 text-sm">{item.productName}</td>
                  <td className="border-r border-black p-2 text-right text-sm">{item.quantity}</td>
                  <td className="border-r border-black p-2 text-right text-sm">₹{item.rate.toFixed(2)}</td>
                  <td className="border-r border-black p-2 text-right text-sm">{item.gstRate}%</td>
                  <td className="p-2 text-right text-sm font-semibold">₹{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b border-gray-400">
                <span className="text-sm">Subtotal:</span>
                <span className="text-sm font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-400">
                <span className="text-sm">GST Amount ({paymentMode === "cash" ? "Inclusive" : "Additional"}):</span>
                <span className="text-sm font-semibold">₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 bg-black text-white px-3">
                <span className="font-bold">GRAND TOTAL:</span>
                <span className="font-bold">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t-2 border-black">
            <div>
              <p className="text-xs mb-4">Terms & Conditions:</p>
              <p className="text-xs">1. Goods once sold cannot be returned</p>
              <p className="text-xs">2. Subject to local jurisdiction</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold mb-12">For Amazeon Shopping</p>
              <p className="text-xs">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

InvoicePrint.displayName = "InvoicePrint";
