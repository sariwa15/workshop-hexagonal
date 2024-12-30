import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./services/user.service";
import { TokenService } from "./services/token.service";
import { EmailService } from "./services/email.service";

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    TokenService,
    EmailService,
  ],
})
export class UserModule {}
