import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import Modules from './modules';
import { AuthCommand } from './modules/auth/auth.command';
@Module({
  imports: [...Modules, AuthCommand],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
