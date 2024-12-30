import {Controller, Get, HttpException, HttpStatus, Param, Post,} from "@nestjs/common";
import {UserService} from "./services/user.service";
import {UserDto} from "./dto/user.dto";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":email")
  async getUser(@Param("email") email: string): Promise<UserDto> {
    return await this.userService.getUser(email);
  }

  @Post(":email")
  async createUser(@Param("email") email: string): Promise<void> {
    try {
      if (!email || !email.includes("@")) {
        throw new HttpException("Invalid email format", HttpStatus.BAD_REQUEST);
      }

      await this.userService.createUser(email);

    } catch (error: any) {
      if (error.message === "User already exists") {
        throw new HttpException("User already exists", HttpStatus.CONFLICT);
      }
      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("email/verification/:token")
  async verifyEmail(@Param("token") token: string): Promise<UserDto> {
    const user = await this.userService.verifyEmailWithToken(token);
    if (!user) {
      throw new HttpException(
        "Invalid or expired verification token",
        HttpStatus.BAD_REQUEST,
      );
    }
    return user;
  }
}
