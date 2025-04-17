//Main Starting point for app

import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import routes from "./routes/index";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";

// Loading env files from .env
dotenv.config();

// Initializing Express Application
const app: Application = express();
const prisma = new PrismaClient()
const PORT = process.env.NODE_ENV === 'test' ? 5002 : process.env.PORT || 5001;

// Security + Middleware
app.use(cors()); //enable CORS
app.use(helmet()); // add security headers
app.use(morgan("dev")); // Log HTTP requests
app.use(express.json()); //For parsing JSON request bodies
app.use(bodyParser.urlencoded({ extended: true})) // Parse URL-encoded data

// Rate Limiting to prevent abuse (100 req/15 mins)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, try again later."
});
app.use(limiter);

// Register routes
app.use("/api", routes)

//Base route check
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "API is running" });
});

// Graceful Shutdown for Prisma
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit();
});

// Start express server only in non-test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export { app };