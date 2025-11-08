import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema, insertInvoiceSchema, insertExpenseSchema } from "@shared/schema";
import { utils, write } from "xlsx";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.sendStatus(403);
    }
    next();
  };

  app.get("/api/products", requireAuth, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.updateProduct(req.params.id, validatedData);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/invoices", requireAuth, async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      const items = await storage.getInvoiceItems(req.params.id);
      res.json({ ...invoice, items });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/invoices", requireAuth, async (req, res) => {
    try {
      const { items, ...invoiceData } = req.body;
      const validatedInvoice = insertInvoiceSchema.parse(invoiceData);
      
      if (!items || items.length === 0) {
        return res.status(400).json({ error: "Invoice must have at least one item" });
      }

      const invoice = await storage.createInvoice(validatedInvoice, items, req.user!.id);
      res.status(201).json(invoice);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/expenses", requireAdmin, async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/expenses", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validatedData, req.user!.id);
      res.status(201).json(expense);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/expenses/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteExpense(req.params.id);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/stats/user", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getSalesStats(req.user!.id);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/stats/admin", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reports/sales", requireAdmin, async (req, res) => {
    try {
      const report = await storage.getSalesReport();
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reports/sales/download", requireAdmin, async (req, res) => {
    try {
      const report = await storage.getSalesReport();

      const summaryData = [
        ["Amazeon Shopping - Sales Report"],
        ["Generated on:", new Date().toLocaleString()],
        [],
        ["Sales Summary"],
        ["Total Sales", `₹${report.totalSales.toFixed(2)}`],
        ["B2C Sales", `₹${report.b2cSales.toFixed(2)}`, `${report.totalSales > 0 ? ((report.b2cSales / report.totalSales) * 100).toFixed(1) : 0}%`],
        ["B2B Sales", `₹${report.b2bSales.toFixed(2)}`, `${report.totalSales > 0 ? ((report.b2bSales / report.totalSales) * 100).toFixed(1) : 0}%`],
        [],
        ["Product-wise Sales"],
        ["Product Name", "Quantity Sold", "Total Sales", "Percentage"],
        ...report.productSales.map((p: any) => [
          p.productName,
          p.quantity,
          `₹${parseFloat(p.totalSales).toFixed(2)}`,
          `${report.totalSales > 0 ? ((parseFloat(p.totalSales) / report.totalSales) * 100).toFixed(1) : 0}%`
        ]),
        [],
        ["Category-wise Sales"],
        ["Category", "Product Count", "Total Sales", "Percentage"],
        ...report.categorySales.map((c: any) => [
          c.category,
          c.productCount,
          `₹${parseFloat(c.totalSales).toFixed(2)}`,
          `${report.totalSales > 0 ? ((parseFloat(c.totalSales) / report.totalSales) * 100).toFixed(1) : 0}%`
        ]),
      ];

      const workbook = utils.book_new();
      const worksheet = utils.aoa_to_sheet(summaryData);
      
      worksheet['!cols'] = [
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 }
      ];

      utils.book_append_sheet(workbook, worksheet, "Sales Report");

      const excelBuffer = write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=sales-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      res.send(excelBuffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
