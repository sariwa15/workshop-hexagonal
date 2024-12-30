import * as EmailValidator from 'email-validator';
import {BadRequestException, Injectable, InternalServerErrorException, NotFoundException} from "@nestjs/common";
import { User } from "../interfaces/user.interface";
import { TokenService } from "./token.service";
import { EmailService } from "./email.service";
import { RowDataPacket } from "mysql2";
import * as mysql from "mysql2/promise";
import { ConfigService } from "@nestjs/config";
import { Config } from 'src/config/config.interface';
import { UserRepository } from '../user.repository';

@Injectable()
export class UserService {
  constructor(
    private configService: ConfigService<Config, true>,
    private tokenService: TokenService,
    private emailService: EmailService,
    private readonly userRepository: UserRepository,
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
    const userData = await this.userRepository.findUserByEmail(email);
  
    if (!userData) {
      throw new NotFoundException('User not found');
    }
  
    return {email: userData.email, verifiedEmail: userData.verifiedEmail};
    
  }

  async createUser(email: string): Promise<void> {
    if (!EmailValidator.validate(email)) {
      throw new BadRequestException();
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
    const updateResult = await this.userRepository.verifyEmailWithToken(payload.email);
   

    return this.getUser(updateResult?.email);
  }
}
