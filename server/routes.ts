import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { waitlistSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();
  
  // Waitlist submission endpoint
  apiRouter.post("/waitlist", async (req, res) => {
    try {
      // Validate request body against schema
      const validatedData = waitlistSchema.parse(req.body);
      
      // Check if email already exists
      const existingEntry = await storage.getWaitlistByEmail(validatedData.email);
      if (existingEntry) {
        return res.status(409).json({ 
          message: "Cette adresse email est déjà inscrite sur notre liste d'attente." 
        });
      }
      
      // Create the waitlist entry
      const newEntry = await storage.createWaitlistEntry(validatedData);
      return res.status(201).json({ 
        message: "Inscription réussie", 
        data: newEntry 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: error.errors 
        });
      }
      
      console.error("Error registering to waitlist:", error);
      return res.status(500).json({ 
        message: "Une erreur est survenue lors de l'inscription. Veuillez réessayer." 
      });
    }
  });

  // Get all waitlist entries (admin endpoint)
  apiRouter.get("/waitlist", async (req, res) => {
    try {
      const entries = await storage.getAllWaitlistEntries();
      return res.status(200).json(entries);
    } catch (error) {
      console.error("Error fetching waitlist entries:", error);
      return res.status(500).json({ 
        message: "Une erreur est survenue lors de la récupération des données." 
      });
    }
  });

  // Mount the API router
  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}
