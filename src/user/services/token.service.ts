import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import { Config } from "src/config/config.interface";

interface TokenPayload {
  email: string;
  expiresAt: number;
}

@Injectable()
export class TokenService {
  private readonly algorithm = "aes-256-cbc";
  private readonly key: Buffer;
  private readonly iv: Buffer;

  constructor(private configService: ConfigService<Config, true>) {
    this.key = crypto.scryptSync(configService.get('tokenEncryptionKey'), "salt", 32);
    this.iv = Buffer.from(configService.get('tokenEncryptionIV'));
  }

  createVerificationToken(email: string): string {
    const expiresAt =
      Date.now() + this.configService.get('verificationTokenExpiryDays') * 24 * 60 * 60 * 1000;

    const payload: TokenPayload = { email, expiresAt };

    try {
      const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
      let encrypted = cipher.update(JSON.stringify(payload), "utf8", "hex");
      encrypted += cipher.final("hex");

      return encrypted;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.key,
        this.iv,
      );
      let decrypted = decipher.update(token, "hex", "utf8");
      decrypted += decipher.final("utf8");

      const payload: TokenPayload = JSON.parse(decrypted);

      if (payload.expiresAt < Date.now()) {
        return null;
      }

      return payload;
    } catch (error) {
      return null;
    }
  }
}
