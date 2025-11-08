import { 
  users, 
  products, 
  invoices, 
  invoiceItems, 
  expenses,
  type User, 
  type InsertUser,
  type Product,
  type InsertProduct,
  type Invoice,
  type InsertInvoice,
  type InvoiceItem,
  type InsertInvoiceItem,
  type Expense,
  type InsertExpense
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, gte, sql, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(insertProduct: InsertProduct): Promise<Product>;
  updateProduct(id: string, insertProduct: InsertProduct): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(insertInvoice: InsertInvoice, items: InsertInvoiceItem[], userId: string): Promise<Invoice>;
  getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]>;
  
  getExpenses(): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(insertExpense: InsertExpense, userId: string): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;
  
  getTodayInvoiceCount(invoiceType: "b2c" | "b2b"): Promise<number>;
  getSalesStats(userId?: string): Promise<any>;
  getAdminStats(): Promise<any>;
  getSalesReport(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.name);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updateProduct(id: string, insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...insertProduct, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async createInvoice(insertInvoice: InsertInvoice, items: InsertInvoiceItem[], userId: string): Promise<Invoice> {
    const invoiceNumber = await this.generateInvoiceNumber(insertInvoice.invoiceType);
    
    const [invoice] = await db
      .insert(invoices)
      .values({
        ...insertInvoice,
        invoiceNumber,
        createdBy: userId,
      })
      .returning();

    const itemsWithInvoiceId = items.map(item => ({
      ...item,
      invoiceId: invoice.id,
    }));

    await db.insert(invoiceItems).values(itemsWithInvoiceId);

    return invoice;
  }

  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }

  async getExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses).orderBy(desc(expenses.date));
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense || undefined;
  }

  async createExpense(insertExpense: InsertExpense, userId: string): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values({
        ...insertExpense,
        createdBy: userId,
      })
      .returning();
    return expense;
  }

  async deleteExpense(id: string): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  async getTodayInvoiceCount(invoiceType: "b2c" | "b2b"): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(invoices)
      .where(
        and(
          eq(invoices.invoiceType, invoiceType),
          gte(invoices.createdAt, today)
        )
      );
    
    return result[0]?.count || 0;
  }

  async generateInvoiceNumber(invoiceType: "b2c" | "b2b"): Promise<string> {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    
    const count = await this.getTodayInvoiceCount(invoiceType);
    const sequenceNumber = String(count + 1).padStart(2, '0');
    
    const prefix = invoiceType === "b2c" ? "AZ" : "AZB";
    return `${prefix}${month}${year}${sequenceNumber}`;
  }

  async getSalesStats(userId?: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const todayInvoices = await db
      .select()
      .from(invoices)
      .where(gte(invoices.createdAt, today));

    const last7DaysInvoices = await db
      .select()
      .from(invoices)
      .where(gte(invoices.createdAt, sevenDaysAgo))
      .orderBy(desc(invoices.createdAt));

    const todaySales = todayInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount), 0);

    const salesByDay = last7DaysInvoices.reduce((acc: any, inv) => {
      const date = inv.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += parseFloat(inv.totalAmount);
      return acc;
    }, {});

    const last7DaysSales = Object.entries(salesByDay).map(([date, total]) => ({
      date,
      total,
    }));

    return {
      todaySales,
      last7DaysSales,
    };
  }

  async getAdminStats(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayInvoices = await db
      .select()
      .from(invoices)
      .where(gte(invoices.createdAt, today));

    const weekInvoices = await db
      .select()
      .from(invoices)
      .where(gte(invoices.createdAt, sevenDaysAgo));

    const monthInvoices = await db
      .select()
      .from(invoices)
      .where(gte(invoices.createdAt, firstDayOfMonth));

    const monthExpenses = await db
      .select()
      .from(expenses)
      .where(gte(expenses.date, firstDayOfMonth));

    const recentInvoices = await db
      .select()
      .from(invoices)
      .orderBy(desc(invoices.createdAt))
      .limit(10);

    const todaySales = todayInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount), 0);
    const weekSales = weekInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount), 0);
    const monthSales = monthInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount), 0);
    const totalExpenses = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    const b2cCount = monthInvoices.filter(inv => inv.invoiceType === 'b2c').length;
    const b2bCount = monthInvoices.filter(inv => inv.invoiceType === 'b2b').length;

    return {
      todaySales,
      weekSales,
      monthSales,
      totalExpenses,
      b2cCount,
      b2bCount,
      recentInvoices,
    };
  }

  async getSalesReport(): Promise<any> {
    const allInvoices = await db
      .select()
      .from(invoices);

    const allItems = await db
      .select({
        productName: invoiceItems.productName,
        quantity: invoiceItems.quantity,
        amount: invoiceItems.amount,
        invoiceType: invoices.invoiceType,
      })
      .from(invoiceItems)
      .leftJoin(invoices, eq(invoiceItems.invoiceId, invoices.id));

    const allProducts = await db.select().from(products);

    const totalSales = allInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount), 0);
    const b2cSales = allInvoices
      .filter(inv => inv.invoiceType === 'b2c')
      .reduce((sum, inv) => sum + parseFloat(inv.totalAmount), 0);
    const b2bSales = allInvoices
      .filter(inv => inv.invoiceType === 'b2b')
      .reduce((sum, inv) => sum + parseFloat(inv.totalAmount), 0);

    const productSalesMap = allItems.reduce((acc: any, item) => {
      const name = item.productName || '';
      if (!acc[name]) {
        acc[name] = { productName: name, quantity: 0, totalSales: 0 };
      }
      acc[name].quantity += item.quantity || 0;
      acc[name].totalSales += parseFloat(item.amount || '0');
      return acc;
    }, {});

    const productSales = Object.values(productSalesMap);

    const categoryMap: { [key: string]: { category: string; totalSales: number; productCount: number } } = {};
    allProducts.forEach(product => {
      if (!categoryMap[product.category]) {
        categoryMap[product.category] = {
          category: product.category,
          totalSales: 0,
          productCount: 0,
        };
      }
      categoryMap[product.category].productCount++;
    });

    allItems.forEach(item => {
      const product = allProducts.find(p => p.name === item.productName);
      if (product) {
        categoryMap[product.category].totalSales += parseFloat(item.amount || '0');
      }
    });

    const categorySales = Object.values(categoryMap);

    return {
      totalSales,
      b2cSales,
      b2bSales,
      productSales,
      categorySales,
    };
  }
}

export const storage = new DatabaseStorage();
