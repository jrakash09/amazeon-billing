import { db } from "./db";
import { products } from "@shared/schema";

async function seed() {
  console.log("Seeding database with sample products...");

  const sampleProducts = [
    { name: "Samsung Galaxy S24", category: "Electronics", rate: "79999.00", gstRate: "18" as const },
    { name: "iPhone 15 Pro", category: "Electronics", rate: "129999.00", gstRate: "18" as const },
    { name: "OnePlus 12", category: "Electronics", rate: "64999.00", gstRate: "18" as const },
    { name: "Sony WH-1000XM5 Headphones", category: "Electronics", rate: "29999.00", gstRate: "18" as const },
    { name: "Apple AirPods Pro", category: "Electronics", rate: "24999.00", gstRate: "18" as const },
    { name: "Dell XPS 15 Laptop", category: "Electronics", rate: "149999.00", gstRate: "18" as const },
    { name: "MacBook Air M3", category: "Electronics", rate: "114999.00", gstRate: "18" as const },
    { name: "iPad Pro 12.9", category: "Electronics", rate: "109999.00", gstRate: "18" as const },
    { name: "Samsung Galaxy Tab S9", category: "Electronics", rate: "74999.00", gstRate: "18" as const },
    { name: "Apple Watch Series 9", category: "Electronics", rate: "44999.00", gstRate: "18" as const },
    { name: "Smart LED TV 55\"", category: "Electronics", rate: "54999.00", gstRate: "18" as const },
    { name: "Wireless Mouse", category: "Accessories", rate: "999.00", gstRate: "18" as const },
    { name: "Mechanical Keyboard", category: "Accessories", rate: "4999.00", gstRate: "18" as const },
    { name: "USB-C Hub", category: "Accessories", rate: "2499.00", gstRate: "18" as const },
    { name: "Power Bank 20000mAh", category: "Accessories", rate: "2999.00", gstRate: "18" as const },
    { name: "Portable SSD 1TB", category: "Storage", rate: "8999.00", gstRate: "18" as const },
    { name: "Webcam HD 1080p", category: "Accessories", rate: "3999.00", gstRate: "18" as const },
    { name: "Gaming Chair", category: "Furniture", rate: "19999.00", gstRate: "18" as const },
    { name: "Office Desk", category: "Furniture", rate: "12999.00", gstRate: "18" as const },
    { name: "Monitor 27\" 4K", category: "Electronics", rate: "34999.00", gstRate: "18" as const },
    { name: "Smart Speaker", category: "Electronics", rate: "4999.00", gstRate: "5" as const },
    { name: "Fitness Tracker", category: "Wearables", rate: "3499.00", gstRate: "18" as const },
    { name: "Bluetooth Earbuds", category: "Electronics", rate: "1999.00", gstRate: "18" as const },
    { name: "Wireless Charger", category: "Accessories", rate: "1499.00", gstRate: "18" as const },
    { name: "Phone Case Premium", category: "Accessories", rate: "799.00", gstRate: "18" as const },
  ];

  try {
    for (const product of sampleProducts) {
      await db.insert(products).values(product);
    }
    console.log(`✅ Successfully seeded ${sampleProducts.length} products`);
  } catch (error) {
    console.error("Error seeding database:", error);
  }

  process.exit(0);
}

seed();
