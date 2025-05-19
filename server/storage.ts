import {
  users,
  stocks,
  holdings,
  transactions,
  type User,
  type UpsertUser,
  type Stock,
  type InsertStock,
  type Holding,
  type InsertHolding,
  type Transaction,
  type InsertTransaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Stock operations
  getStocks(): Promise<Stock[]>;
  getStock(id: number): Promise<Stock | undefined>;
  getStockBySymbol(symbol: string): Promise<Stock | undefined>;
  updateStockPrice(id: number, newPrice: number): Promise<Stock>;
  createStock(stock: InsertStock): Promise<Stock>;
  initializeStocks(): Promise<void>;

  // Holdings operations
  getHoldings(userId: string): Promise<(Holding & { stock: Stock })[]>;
  getHolding(id: number): Promise<(Holding & { stock: Stock }) | undefined>;
  getHoldingByUserAndStock(userId: string, stockId: number): Promise<Holding | undefined>;
  createHolding(holding: InsertHolding): Promise<Holding>;
  updateHolding(id: number, quantity: number, averagePrice: number, totalValue: number): Promise<Holding>;
  deleteHolding(id: number): Promise<void>;

  // Transactions operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<(Transaction & { stock: Stock })[]>;

  // Portfolio operations
  updateUserBalance(userId: string, newBalance: number): Promise<User>;
  updateUserPortfolioStats(userId: string): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        balance: userData.balance || "100000.00",
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Stock operations
  async getStocks(): Promise<Stock[]> {
    return await db.select().from(stocks);
  }

  async getStock(id: number): Promise<Stock | undefined> {
    const [stock] = await db.select().from(stocks).where(eq(stocks.id, id));
    return stock;
  }

  async getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    const [stock] = await db.select().from(stocks).where(eq(stocks.symbol, symbol));
    return stock;
  }

  async updateStockPrice(id: number, newPrice: number): Promise<Stock> {
    const stock = await this.getStock(id);
    if (!stock) {
      throw new Error("Stock not found");
    }

    const previousPrice = parseFloat(stock.currentPrice.toString());
    const change = newPrice - previousPrice;
    const changePercent = (change / previousPrice) * 100;

    const [updatedStock] = await db
      .update(stocks)
      .set({
        previousPrice: stock.currentPrice,
        currentPrice: newPrice,
        change,
        changePercent,
        updatedAt: new Date(),
      })
      .where(eq(stocks.id, id))
      .returning();

    return updatedStock;
  }

  async createStock(stock: InsertStock): Promise<Stock> {
    const [createdStock] = await db.insert(stocks).values(stock).returning();
    return createdStock;
  }

  async initializeStocks(): Promise<void> {
    const existingStocks = await this.getStocks();
    if (existingStocks.length > 0) {
      return; // Stocks already initialized
    }

    const stocksData: InsertStock[] = [
      {
        name: "TechNova",
        symbol: "TCNV",
        shortName: "TN",
        currentPrice: 920,
        previousPrice: 910,
        initialPrice: 900,
        change: 10,
        changePercent: 1.1,
        color: "primary",
      },
      {
        name: "GreenLabs",
        symbol: "GRNL",
        shortName: "GL",
        currentPrice: 1380,
        previousPrice: 1350,
        initialPrice: 1300,
        change: 30,
        changePercent: 2.22,
        color: "secondary",
      },
      {
        name: "QuantumComp",
        symbol: "QNTC",
        shortName: "QC",
        currentPrice: 1080,
        previousPrice: 1100,
        initialPrice: 1150,
        change: -20,
        changePercent: -1.82,
        color: "accent",
      },
      {
        name: "InfraBuild",
        symbol: "INFB",
        shortName: "IB",
        currentPrice: 385,
        previousPrice: 420,
        initialPrice: 400,
        change: -35,
        changePercent: -8.33,
        color: "primary",
      },
      {
        name: "SolarMaxx",
        symbol: "SOLM",
        shortName: "SM",
        currentPrice: 645,
        previousPrice: 620,
        initialPrice: 600,
        change: 25,
        changePercent: 4.03,
        color: "secondary",
      },
      {
        name: "DroneTech",
        symbol: "DRNT",
        shortName: "DT",
        currentPrice: 780,
        previousPrice: 760,
        initialPrice: 750,
        change: 20,
        changePercent: 2.63,
        color: "primary",
      },
      {
        name: "CryptoBank",
        symbol: "CRYB",
        shortName: "CB",
        currentPrice: 2250,
        previousPrice: 2300,
        initialPrice: 2100,
        change: -50,
        changePercent: -2.17,
        color: "accent",
      },
      {
        name: "MicroLogic",
        symbol: "MCLG",
        shortName: "ML",
        currentPrice: 532,
        previousPrice: 545,
        initialPrice: 550,
        change: -13,
        changePercent: -2.39,
        color: "secondary",
      },
      {
        name: "BioGenix",
        symbol: "BGNX",
        shortName: "BG",
        currentPrice: 1850,
        previousPrice: 1800,
        initialPrice: 1700,
        change: 50,
        changePercent: 2.78,
        color: "primary",
      },
      {
        name: "AeroSpace",
        symbol: "ARSP",
        shortName: "AS",
        currentPrice: 3100,
        previousPrice: 3050,
        initialPrice: 3000,
        change: 50,
        changePercent: 1.64,
        color: "secondary",
      },
      {
        name: "RetailNow",
        symbol: "RTNW",
        shortName: "RN",
        currentPrice: 428,
        previousPrice: 435,
        initialPrice: 450,
        change: -7,
        changePercent: -1.61,
        color: "accent",
      },
      {
        name: "FoodExpress",
        symbol: "FDEX",
        shortName: "FE",
        currentPrice: 685,
        previousPrice: 670,
        initialPrice: 650,
        change: 15,
        changePercent: 2.24,
        color: "primary",
      },
      {
        name: "MediaPlus",
        symbol: "MEDP",
        shortName: "MP",
        currentPrice: 890,
        previousPrice: 860,
        initialPrice: 850,
        change: 30,
        changePercent: 3.49,
        color: "secondary",
      },
      {
        name: "EnergyTech",
        symbol: "ENTC",
        shortName: "ET",
        currentPrice: 1470,
        previousPrice: 1500,
        initialPrice: 1450,
        change: -30,
        changePercent: -2,
        color: "accent",
      },
      {
        name: "HealthWave",
        symbol: "HLWV",
        shortName: "HW",
        currentPrice: 2350,
        previousPrice: 2320,
        initialPrice: 2300,
        change: 30,
        changePercent: 1.29,
        color: "primary",
      },
      {
        name: "CloudSoft",
        symbol: "CLSF",
        shortName: "CS",
        currentPrice: 1620,
        previousPrice: 1600,
        initialPrice: 1550,
        change: 20,
        changePercent: 1.25,
        color: "secondary",
      },
      {
        name: "AutoDrive",
        symbol: "ATDR",
        shortName: "AD",
        currentPrice: 750,
        previousPrice: 780,
        initialPrice: 800,
        change: -30,
        changePercent: -3.85,
        color: "accent",
      },
      {
        name: "EdTechNow",
        symbol: "EDTN",
        shortName: "EN",
        currentPrice: 420,
        previousPrice: 405,
        initialPrice: 400,
        change: 15,
        changePercent: 3.7,
        color: "primary",
      },
      {
        name: "FinServices",
        symbol: "FNSV",
        shortName: "FS",
        currentPrice: 1280,
        previousPrice: 1250,
        initialPrice: 1200,
        change: 30,
        changePercent: 2.4,
        color: "secondary",
      },
      {
        name: "BlockData",
        symbol: "BLKD",
        shortName: "BD",
        currentPrice: 580,
        previousPrice: 595,
        initialPrice: 600,
        change: -15,
        changePercent: -2.52,
        color: "accent",
      },
    ];

    // Insert all stocks
    for (const stock of stocksData) {
      await this.createStock(stock);
    }
  }

  // Holdings operations
  async getHoldings(userId: string): Promise<(Holding & { stock: Stock })[]> {
    return db
      .select({
        ...holdings,
        stock: stocks,
      })
      .from(holdings)
      .innerJoin(stocks, eq(holdings.stockId, stocks.id))
      .where(eq(holdings.userId, userId));
  }

  async getHolding(id: number): Promise<(Holding & { stock: Stock }) | undefined> {
    const [holding] = await db
      .select({
        ...holdings,
        stock: stocks,
      })
      .from(holdings)
      .innerJoin(stocks, eq(holdings.stockId, stocks.id))
      .where(eq(holdings.id, id));
    
    return holding;
  }

  async getHoldingByUserAndStock(userId: string, stockId: number): Promise<Holding | undefined> {
    const [holding] = await db
      .select()
      .from(holdings)
      .where(
        and(
          eq(holdings.userId, userId),
          eq(holdings.stockId, stockId)
        )
      );
    
    return holding;
  }

  async createHolding(holding: InsertHolding): Promise<Holding> {
    const [createdHolding] = await db.insert(holdings).values(holding).returning();
    return createdHolding;
  }

  async updateHolding(id: number, quantity: number, averagePrice: number, totalValue: number): Promise<Holding> {
    const [updatedHolding] = await db
      .update(holdings)
      .set({
        quantity,
        averagePrice,
        totalValue,
        updatedAt: new Date(),
      })
      .where(eq(holdings.id, id))
      .returning();
    
    return updatedHolding;
  }

  async deleteHolding(id: number): Promise<void> {
    await db.delete(holdings).where(eq(holdings.id, id));
  }

  // Transactions operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [createdTransaction] = await db.insert(transactions).values(transaction).returning();
    return createdTransaction;
  }

  async getUserTransactions(userId: string): Promise<(Transaction & { stock: Stock })[]> {
    return db
      .select({
        ...transactions,
        stock: stocks,
      })
      .from(transactions)
      .innerJoin(stocks, eq(transactions.stockId, stocks.id))
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.transactionDate));
  }

  // Portfolio operations
  async updateUserBalance(userId: string, newBalance: number): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        balance: newBalance,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async updateUserPortfolioStats(userId: string): Promise<User> {
    // Calculate total holdings value and total invested
    const result = await db
      .select({
        totalValue: sql`SUM(${holdings.totalValue})`,
        totalInvested: sql`SUM(${holdings.quantity} * ${holdings.averagePrice})`,
      })
      .from(holdings)
      .where(eq(holdings.userId, userId));
    
    const totalValue = result[0]?.totalValue || 0;
    const totalInvested = result[0]?.totalInvested || 0;
    
    // Update user's portfolio value and total invested
    const [updatedUser] = await db
      .update(users)
      .set({
        portfolioValue: totalValue,
        totalInvested: totalInvested,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }
}

export const storage = new DatabaseStorage();
