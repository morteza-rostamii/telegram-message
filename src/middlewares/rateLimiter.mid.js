import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 30 * 1000, // 30 seconds
  max: 1, // limit each IP to 1 requests per windowMs
  message: {
    error: "Too many requests, please try again later.",
  },
});
