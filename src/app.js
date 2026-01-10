import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// API info endpoint
app.get("/api", (req, res) => {
    res.status(200).json({ 
        message: "Gemini Chatbot API",
        endpoints: {
            chat: "POST /api/chat - Chat with Gemini AI",
            health: "GET /health - Health check"
        }
    });
});

// Works endpoint (portfolio/projects)
app.get("/works", (req, res) => {
    res.status(200).json({ 
        message: "Portfolio Works API",
        data: {
            projects: [
                {
                    id: 1,
                    title: "AI Chatbot",
                    description: "Interactive chatbot powered by Gemini AI",
                    technology: ["React", "Node.js", "Gemini API"],
                    status: "completed"
                },
                {
                    id: 2,
                    title: "Portfolio Website",
                    description: "Personal portfolio and travel blog",
                    technology: ["React", "Vite", "Tailwind CSS"],
                    status: "in-progress"
                }
            ]
        }
    });
});

// Catch-all handler for undefined routes
app.use("*", (req, res) => {
    res.status(404).json({ 
        error: "Route not found",
        message: `Cannot ${req.method} ${req.originalUrl}`,
        availableRoutes: {
            "GET /health": "Health check",
            "GET /api": "API information",
            "GET /works": "Portfolio works",
            "POST /api/chat": "Chat with AI"
        }
    });
});

// API routes
app.use("/api/chat", chatRoutes);

// Error handling
app.use(errorHandler);

export default app;
