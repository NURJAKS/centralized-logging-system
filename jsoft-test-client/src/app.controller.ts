import { Controller, Body, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('checkout')
  makeOrder(@Body() body: any) {
    if (body.amount < 0) {
      throw new Error(
        'Fatal: База данных упала при попытке сохранить отрицательную сумму!',
      );
    }
    return { success: true };
  }

  @Post('crash-test')
  simulateCrash(@Body() body: any) {
    const orderData: any = null;

    const price = orderData.price;

    return { message: 'Если ты видишь это, значит ошибка не сработала', price };
  }
}
