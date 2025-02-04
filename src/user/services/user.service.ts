import * as EmailValidator from 'email-validator';
import {BadRequestException, Injectable, InternalServerErrorException, NotFoundException} from "@nestjs/common";
import { User } from "../interfaces/user.interface";
import { TokenService } from "./token.service";
import { EmailService } from "./email.service";
import { RowDataPacket } from "mysql2";
import * as mysql from "mysql2/promise";
import { ConfigService } from "@nestjs/config";
import { Config } from 'src/config/config.interface';

@Injectable()
export class UserService {
  constructor(
    private configService: ConfigService<Config, true>,
    private tokenService: TokenService,
    private emailService: EmailService,
  ) {}

  private async getConnection() {
    const connectionConfig = {
      host: this.configService.get('host'),
      user: this.configService.get('user'),
      port: this.configService.get('port'),
      password: this.configService.get('password'),
      database: this.configService.get('database'),
    };
    return mysql.createConnection(connectionConfig);
  }

  async getUser(email: string): Promise<User> {
    const connection = await this.getConnection();
    let rows: any;
    try {
      [rows] = await connection.execute<RowDataPacket[]>(
          "SELECT email, verified_email as verifiedEmail FROM users WHERE email = ?",
          [email],
      );
    } catch (err) {
      throw new InternalServerErrorException();
    }

    if (rows.length === 0) {
      throw new NotFoundException();
    }

    const user = rows[0] as unknown as User;
    return {
      ...user,
      verifiedEmail: !!user.verifiedEmail,
    };
  }

  async createUser(email: string): Promise<void> {
    if (!EmailValidator.validate(email)) {
      throw new BadRequestException();
    }
    const connection = await this.getConnection();

    try {
      await connection.execute("INSERT INTO users (email) VALUES (?)", [email]);
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        // user already exists, it's ok, ignore.
        // assuming that the entire flow was successfully completed at some point
        console.log("dup!")
        return;
      }
      console.log(error);
      throw new InternalServerErrorException();
    }

    const verificationToken = this.tokenService.createVerificationToken(email);
    console.log({verificationToken});
    try {
      await this.emailService.sendVerificationEmail(email, verificationToken);
    } catch (error: any) {
      throw new InternalServerErrorException();
    }
  }

  async verifyEmailWithToken(token: string): Promise<User | null> {
    const payload = this.tokenService.verifyToken(token);
    if (!payload) {
      return null;
    }

    const connection = await this.getConnection();
    const [result] = await connection.execute(
      "UPDATE users SET verified_email = TRUE WHERE email = ? AND verified_email = FALSE",
      [payload.email],
    );

    const updateResult = result as any;
    if (updateResult.affectedRows === 0) {
      return null;
    }

    return this.getUser(payload.email);
  }
}
