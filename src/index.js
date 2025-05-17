import cors from "cors";
import express from "express";
import {
  API_PREFIX,
  PORT,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
} from "#@/config/config.js";
import http from "http";
import cookieParser from "cookie-parser";
import expressListRoutes from "express-list-routes";

// cors options
const corsOptions = {
  origin: "*", // ✅ must match your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const app = express();

// setup middlewares
app.use(cors(corsOptions));
// parse json request body
app.use(express.json());
// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// parse cookies
app.use(cookieParser());

// serve static files from public directory
app.use(express.static("public"));

// index route
app.get("/", async (req, res) => {
  res.send("this is a sample Proxy");
});

// message telegram
app.post("/contact/telegram", async (req, res) => {
  const message = req.body?.message;

  try {
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${message}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to send message" });
    }

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// setup a 404 route for all other routes not found
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// setup error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// now: an IIFE function to start the http server once and also to handle the shutdown gracefully
(async () => {
  // Create HTTP server
  const server = http.createServer(app);

  // Start server
  server.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
  });

  // print all routes
  console.log("************** routes\n");

  // console.log(usersRoute.stack);
  expressListRoutes(app, {
    color: true,
    prefix: "",
  });

  // expressListRoutes(app, "routes:");
  console.log("************** routes\n");

  // Handle graceful shutdown
  const gracefulShutdown = () => {
    console.log("Received shutdown signal. Closing server...");

    // Stop accepting new connections
    server.close((err) => {
      if (err) {
        console.error("Error during server shutdown:", err);
        process.exit(1);
      }

      console.log("Server closed successfully");
      process.exit(0);
    });

    // Force close after 10 seconds if connections persist
    setTimeout(() => {
      console.error("Forcing server shutdown due to timeout");
      process.exit(1);
    }, 10000);
  };

  // Listen for termination signals
  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);

  // Handle uncaught exceptions
  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    gracefulShutdown();
  });
})();

// expressListRoutes(app, "routes:"); // 👈 will console log route info
