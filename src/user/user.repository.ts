import * as EmailValidator from 'email-validator';
import {BadRequestException, Injectable, InternalServerErrorException, NotFoundException} from "@nestjs/common";
import { User } from "../interfaces/user.interface";
import { TokenService } from "./token.service";
import { EmailService } from "./email.service";
import { RowDataPacket } from "mysql2";
import * as mysql from "mysql2/promise";
import { ConfigService } from "@nestjs/config";
import { Config } from 'src/config/config.interface';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserRepository {
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

  async findUserByEmail(email: string): Promise<RowDataPacket | null> {
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
  
    return rows.length > 0 ? rows[0] : null;
  }

 
  async createUser(email: string): Promise<void> {
    const connection = await this.getConnection();
  
    try {
      await connection.execute("INSERT INTO users (email) VALUES (?)", [email]);
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        // Ignore duplicate entry, as it's not considered an error in this flow
        console.info(`User with email ${email} already exists.`);
        return;
      }
  
      console.error(`Error inserting user with email ${email}:`, error);
      throw new InternalServerErrorException('Failed to create user');
    }  }
  

  async verifyEmailWithToken(email: string): Promise<string> {
    const connection = await this.getConnection();
    const [result] = await connection.execute(
      "UPDATE users SET verified_email = TRUE WHERE email = ? AND verified_email = FALSE",
      [email],
    );
    // const updateResult = result as any;
    // if (updateResult.affectedRows === 0) {
    //     return null;
    //   }
    return email;
  }
}
