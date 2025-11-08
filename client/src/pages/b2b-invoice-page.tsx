import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  rate: number;
  gstRate: "5" | "18";
  amount: number;
}

export default function B2BInvoicePage() {
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerGst, setCustomerGst] = useState("");
  const [paymentMode, setPaymentMode] = useState<"cash" | "online">("online");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customRate, setCustomRate] = useState<number | null>(null);

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/invoices", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "B2B Invoice created!",
        description: `Invoice ${data.invoiceNumber} has been generated successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/admin"] });
      setCustomerName("");
      setCustomerPhone("");
      setCustomerGst("");
      setPaymentMode("online");
      setItems([]);
      setSelectedProduct("");
      setQuantity(1);
      setCustomRate(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create invoice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addItem = () => {
    if (!selectedProduct) {
      toast({
        title: "Please select a product",
        variant: "destructive",
      });
      return;
    }

    const product = (products || []).find((p: any) => p.id === selectedProduct);
    if (!product) return;

    const rate = customRate !== null ? customRate : parseFloat(product.rate);
    const amount = rate * quantity;

    const newItem: InvoiceItem = {
      productId: product.id,
      productName: product.name,
      quantity,
      rate,
      gstRate: product.gstRate,
      amount,
    };

    setItems([...items, newItem]);
    setSelectedProduct("");
    setQuantity(1);
    setCustomRate(null);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    let gstAmount = 0;
    let totalAmount = 0;

    if (paymentMode === "cash") {
      items.forEach(item => {
        const gstRate = parseFloat(item.gstRate) / 100;
        const itemGst = (item.amount * gstRate) / (1 + gstRate);
        gstAmount += itemGst;
      });
      totalAmount = subtotal;
    } else {
      items.forEach(item => {
        const gstRate = parseFloat(item.gstRate) / 100;
        const itemGst = item.amount * gstRate;
        gstAmount += itemGst;
      });
      totalAmount = subtotal + gstAmount;
    }

    return { subtotal, gstAmount, totalAmount };
  };

  const { subtotal, gstAmount, totalAmount } = calculateTotals();

  const handleSubmit = () => {
    if (!customerName || !customerPhone || !customerGst || items.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields including GST number and add at least one item.",
        variant: "destructive",
      });
      return;
    }

    createInvoiceMutation.mutate({
      invoiceType: "b2b",
      customerName,
      customerPhone,
      customerGst,
      paymentMode,
      subtotal: subtotal.toString(),
      gstAmount: gstAmount.toString(),
      totalAmount: totalAmount.toString(),
      items: items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        rate: item.rate.toString(),
        gstRate: item.gstRate,
        amount: item.amount.toString(),
      })),
    });
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create B2B Invoice</h1>
            <p className="text-muted-foreground mt-1">Generate a business-to-business invoice with AZB series numbering</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Business Customer Details</CardTitle>
              <CardDescription>Enter business customer information with GST number</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-name-b2b">Business Name *</Label>
                  <Input
                    id="customer-name-b2b"
                    data-testid="input-b2b-customer-name"
                    placeholder="Enter business name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-phone-b2b">Contact Phone *</Label>
                  <Input
                    id="customer-phone-b2b"
                    data-testid="input-b2b-customer-phone"
                    placeholder="Enter phone number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-gst">GST Number *</Label>
                  <Input
                    id="customer-gst"
                    data-testid="input-b2b-customer-gst"
                    placeholder="Enter GST number"
                    value={customerGst}
                    onChange={(e) => setCustomerGst(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-mode-b2b">Payment Mode *</Label>
                  <Select value={paymentMode} onValueChange={(value: "cash" | "online") => setPaymentMode(value)}>
                    <SelectTrigger id="payment-mode-b2b" data-testid="select-b2b-payment-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash (GST Inclusive)</SelectItem>
                      <SelectItem value="online">Online (GST Additional)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Items</CardTitle>
              <CardDescription>Select products from inventory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="product-b2b">Product</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger id="product-b2b" data-testid="select-b2b-product">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {(products || []).map((product: any) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (₹{product.rate} - {product.gstRate}% GST)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity-b2b">Quantity</Label>
                  <Input
                    id="quantity-b2b"
                    data-testid="input-b2b-quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-rate-b2b">Custom Rate</Label>
                  <Input
                    id="custom-rate-b2b"
                    data-testid="input-b2b-custom-rate"
                    type="number"
                    step="0.01"
                    placeholder="Override rate"
                    value={customRate ?? ""}
                    onChange={(e) => setCustomRate(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
              </div>
              <Button onClick={addItem} data-testid="button-b2b-add-item">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>

              {items.length > 0 && (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">GST</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">₹{item.rate.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{item.gstRate}%</TableCell>
                          <TableCell className="text-right">₹{item.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                              data-testid={`button-b2b-remove-item-${index}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST Amount ({paymentMode === "cash" ? "Inclusive" : "Additional"}):</span>
                  <span className="font-medium">₹{gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total Amount:</span>
                  <span data-testid="text-b2b-total-amount">₹{totalAmount.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={createInvoiceMutation.isPending}
                  data-testid="button-generate-b2b-invoice"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  {createInvoiceMutation.isPending ? "Generating..." : "Generate B2B Invoice"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
