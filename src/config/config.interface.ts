export interface Config {
  baseUrl: string;
  tokenEncryptionKey: string;
  tokenEncryptionIV: string;
  verificationTokenExpiryDays: number;
  mailerSendApiKey: string;
  mailerSendFromEmail: string;
  mailerSendFromName: string;
  sendgridApiKey: string;
  sendgridFromEmail: string;
  sendgridFromName: string;
}
