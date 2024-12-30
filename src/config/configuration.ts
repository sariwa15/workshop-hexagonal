import { Config } from "./config.interface";

const configuration: Config = {
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
  tokenEncryptionKey:
    process.env.TOKEN_ENCRYPTION_KEY ||
    "your-secret-key-min-32-chars-long!!!!",
  tokenEncryptionIV: process.env.TOKEN_ENCRYPTION_IV || "your-iv-16-chars!",
  verificationTokenExpiryDays: parseInt(
    process.env.VERIFICATION_TOKEN_EXPIRY_DAYS || "5",
  ),
  mailerSendApiKey: process.env.MAILER_SEND_API_KEY || "apikey",
  mailerSendFromName: process.env.MAILER_SEND_FROM_NAME || "dummy",
  mailerSendFromEmail: process.env.MAILER_SEND_FROM_EMAIL || "dummy@abc.com",
  sendgridApiKey: process.env.SENDGRID_API_KEY || "apikey",
  sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL || "dummy@abc.com",
  sendgridFromName: "",

  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "user_service",
} 

export default () => configuration;