import dotenv from "dotenv";

dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || "development";
export const PORT = process.env.PORT || 5000;
export const API_PREFIX = process.env.API_PREFIX || "/api/v1";
export const MONGO_URI = process.env.MONGO_URI || "";
export const JWT_SECRET = process.env.JWT_SECRET || "secret";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
export const JWT_COOKIE_EXPIRES_IN = process.env.JWT_COOKIE_EXPIRES_IN || "1d";
export const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || "token";

export const BACKEND_URL =
  NODE_ENV === "development"
    ? process.env.BACKEND_URL_DEV
    : process.env.BACKEND_URL_PROD;

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export const FRONT_URL =
  NODE_ENV === "development"
    ? process.env.FRONT_URL_DEV
    : process.env.FRONT_URL_PROD;

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export const MY_GMAIL_ADDRESS = process.env.MY_GMAIL_ADDRESS;
export const APP_PASSWORD = process.env.APP_PASSWORD;
