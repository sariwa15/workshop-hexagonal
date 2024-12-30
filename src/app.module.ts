import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";

@Module({
  imports: [
    ConfigModule.forRoot({
    isGlobal: true,
    cache: true,
    load: [configuration],
  }),
   UserModule
  ],
})
export class AppModule {}
