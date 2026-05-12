import {
  Controller,
  Body,
  Post,
  HttpException,
  HttpStatus,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller('test-crash')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('async-boom')
  async testAsync() {
    setTimeout(() => {
      throw new Error(
        'Фоновая ошибка: процесс упал спустя 2 секунды после ответа клиенту!',
      );
    }, 2000);
    return { message: 'Запрос принят, но скоро случится бабах в фоне' };
  }

  @Post('nested-null')
  testNested() {
    const data: any = { user: { profile: null } };
    return data.user.profile.settings.theme;
  }

  @Post('stack-overflow')
  testStack() {
    const recursiveFunc = () => recursiveFunc();
    recursiveFunc();
  }

  @Post('db-timeout')
  testTimeout() {
    throw new ServiceUnavailableException(
      'Database connection lost: Connection timeout after 5000ms',
    );
  }

  @Post('math-error')
  testMath() {
    const result = 100 / 0;
    if (!isFinite(result)) {
      throw new BadRequestException(
        'Критическая математическая ошибка: деление на ноль в финансовом расчете',
      );
    }
  }

  @Post('corrupted-data')
  testCorrupted(@Body() body: any) {
    const entries = Object.entries(body.someFieldThatMustExist);
    return entries;
  }

  @Post('memory-leak')
  testMemory() {
    const memoryHog = [] as any[];
    while (true) {
      memoryHog.push(new Array(1000000).fill('💣'));
    }
  }
}
