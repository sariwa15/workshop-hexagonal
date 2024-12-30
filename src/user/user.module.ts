import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./services/user.service";
import { TokenService } from "./services/token.service";
import { EmailService } from "./services/email.service";
import { ConfigService } from "../config/config.service";

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    TokenService,
    EmailService,
    ConfigService,
  ],
})
export class UserModule {}
