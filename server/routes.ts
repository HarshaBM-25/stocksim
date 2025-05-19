import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { buyStockSchema, sellStockSchema, updateHoldingSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize stocks
  await storage.initializeStocks();

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Stock routes
  app.get('/api/stocks', async (req, res) => {
    try {
      const stocks = await storage.getStocks();
      res.json(stocks);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      res.status(500).json({ message: "Failed to fetch stocks" });
    }
  });

  app.get('/api/stocks/:id', async (req, res) => {
    try {
      const stockId = parseInt(req.params.id);
      const stock = await storage.getStock(stockId);
      
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      res.json(stock);
    } catch (error) {
      console.error("Error fetching stock:", error);
      res.status(500).json({ message: "Failed to fetch stock" });
    }
  });

  // Portfolio routes
  app.get('/api/portfolio', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const holdings = await storage.getHoldings(userId);
      
      res.json({
        balance: user?.balance,
        portfolioValue: user?.portfolioValue,
        totalInvested: user?.totalInvested,
        holdings
      });
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  // Holdings routes
  app.get('/api/holdings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const holdings = await storage.getHoldings(userId);
      res.json(holdings);
    } catch (error) {
      console.error("Error fetching holdings:", error);
      res.status(500).json({ message: "Failed to fetch holdings" });
    }
  });

  app.get('/api/holdings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const holdingId = parseInt(req.params.id);
      const holding = await storage.getHolding(holdingId);
      
      if (!holding) {
        return res.status(404).json({ message: "Holding not found" });
      }
      
      // Ensure user can only view their own holdings
      if (holding.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Not authorized to view this holding" });
      }
      
      res.json(holding);
    } catch (error) {
      console.error("Error fetching holding:", error);
      res.status(500).json({ message: "Failed to fetch holding" });
    }
  });

  app.patch('/api/holdings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const holdingId = parseInt(req.params.id);
      const holding = await storage.getHolding(holdingId);
      
      if (!holding) {
        return res.status(404).json({ message: "Holding not found" });
      }
      
      // Ensure user can only update their own holdings
      if (holding.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this holding" });
      }

      // Validate request body
      const validatedData = updateHoldingSchema.parse({
        holdingId,
        quantity: req.body.quantity
      });
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Calculate the difference in quantity
      const quantityDifference = validatedData.quantity - holding.quantity;
      
      // If adding more shares, ensure user has enough balance
      if (quantityDifference > 0) {
        const additionalCost = quantityDifference * parseFloat(holding.stock.currentPrice.toString());
        
        // Check if user has enough balance
        if (parseFloat(user.balance.toString()) < additionalCost) {
          return res.status(400).json({ message: "Insufficient balance" });
        }
        
        // Update user balance
        const newBalance = parseFloat(user.balance.toString()) - additionalCost;
        await storage.updateUserBalance(userId, newBalance);
      }
      
      // Update holding
      const updatedHolding = await storage.updateHolding(
        holdingId,
        validatedData.quantity,
        parseFloat(holding.averagePrice.toString()),
        validatedData.quantity * parseFloat(holding.stock.currentPrice.toString())
      );
      
      // Update user portfolio stats
      await storage.updateUserPortfolioStats(userId);
      
      res.json(updatedHolding);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error updating holding:", error);
      res.status(500).json({ message: "Failed to update holding" });
    }
  });

  app.delete('/api/holdings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const holdingId = parseInt(req.params.id);
      const holding = await storage.getHolding(holdingId);
      
      if (!holding) {
        return res.status(404).json({ message: "Holding not found" });
      }
      
      // Ensure user can only delete their own holdings
      if (holding.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Not authorized to delete this holding" });
      }
      
      // Get user
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Calculate return amount
      const returnAmount = parseFloat(holding.quantity.toString()) * parseFloat(holding.stock.currentPrice.toString());
      const newBalance = parseFloat(user.balance.toString()) + returnAmount;
      
      // Delete holding
      await storage.deleteHolding(holdingId);
      
      // Update user balance
      await storage.updateUserBalance(req.user.claims.sub, newBalance);
      
      // Update user portfolio stats
      await storage.updateUserPortfolioStats(req.user.claims.sub);
      
      // Create sell transaction
      await storage.createTransaction({
        userId: req.user.claims.sub,
        stockId: holding.stockId,
        type: "sell",
        quantity: holding.quantity,
        price: holding.stock.currentPrice,
        total: returnAmount
      });
      
      res.json({ message: "Holding deleted successfully" });
    } catch (error) {
      console.error("Error deleting holding:", error);
      res.status(500).json({ message: "Failed to delete holding" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Buy stock route
  app.post('/api/stocks/buy', isAuthenticated, async (req: any, res) => {
    try {
      // Validate request body
      const validatedData = buyStockSchema.parse(req.body);
      
      const userId = req.user.claims.sub;
      const stockId = validatedData.stockId;
      const quantity = validatedData.quantity;
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get stock
      const stock = await storage.getStock(stockId);
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      // Calculate total cost
      const totalCost = quantity * parseFloat(stock.currentPrice.toString());
      
      // Check if user has enough balance
      if (parseFloat(user.balance.toString()) < totalCost) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Check if user already has this stock
      const existingHolding = await storage.getHoldingByUserAndStock(userId, stockId);
      
      if (existingHolding) {
        // Update existing holding
        const currentQuantity = existingHolding.quantity;
        const currentAvgPrice = parseFloat(existingHolding.averagePrice.toString());
        const newQuantity = currentQuantity + quantity;
        const newAvgPrice = ((currentQuantity * currentAvgPrice) + totalCost) / newQuantity;
        const newTotalValue = newQuantity * parseFloat(stock.currentPrice.toString());
        
        await storage.updateHolding(existingHolding.id, newQuantity, newAvgPrice, newTotalValue);
      } else {
        // Create new holding
        await storage.createHolding({
          userId,
          stockId,
          quantity,
          averagePrice: stock.currentPrice,
          totalValue: totalCost
        });
      }
      
      // Update user balance
      const newBalance = parseFloat(user.balance.toString()) - totalCost;
      await storage.updateUserBalance(userId, newBalance);
      
      // Update user portfolio stats
      await storage.updateUserPortfolioStats(userId);
      
      // Create transaction
      const transaction = await storage.createTransaction({
        userId,
        stockId,
        type: "buy",
        quantity,
        price: stock.currentPrice,
        total: totalCost
      });
      
      res.status(201).json({
        message: "Stock purchased successfully",
        transaction
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error buying stock:", error);
      res.status(500).json({ message: "Failed to buy stock" });
    }
  });

  // Sell stock route
  app.post('/api/stocks/sell', isAuthenticated, async (req: any, res) => {
    try {
      // Validate request body
      const validatedData = sellStockSchema.parse(req.body);
      
      const userId = req.user.claims.sub;
      const holdingId = validatedData.holdingId;
      const sellQuantity = validatedData.quantity;
      
      // Get holding
      const holding = await storage.getHolding(holdingId);
      if (!holding) {
        return res.status(404).json({ message: "Holding not found" });
      }
      
      // Ensure user can only sell their own holdings
      if (holding.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to sell this holding" });
      }
      
      // Check if quantity is valid
      if (sellQuantity > holding.quantity) {
        return res.status(400).json({ message: "Sell quantity exceeds holding quantity" });
      }
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Calculate total return
      const totalReturn = sellQuantity * parseFloat(holding.stock.currentPrice.toString());
      
      // If selling all shares, delete the holding
      if (sellQuantity === holding.quantity) {
        await storage.deleteHolding(holdingId);
      } else {
        // Otherwise update the holding
        const newQuantity = holding.quantity - sellQuantity;
        const newTotalValue = newQuantity * parseFloat(holding.stock.currentPrice.toString());
        
        await storage.updateHolding(
          holdingId,
          newQuantity,
          parseFloat(holding.averagePrice.toString()),
          newTotalValue
        );
      }
      
      // Update user balance
      const newBalance = parseFloat(user.balance.toString()) + totalReturn;
      await storage.updateUserBalance(userId, newBalance);
      
      // Update user portfolio stats
      await storage.updateUserPortfolioStats(userId);
      
      // Create transaction
      const transaction = await storage.createTransaction({
        userId,
        stockId: holding.stockId,
        type: "sell",
        quantity: sellQuantity,
        price: holding.stock.currentPrice,
        total: totalReturn
      });
      
      res.status(201).json({
        message: "Stock sold successfully",
        transaction
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error selling stock:", error);
      res.status(500).json({ message: "Failed to sell stock" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
