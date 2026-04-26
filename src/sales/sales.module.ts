import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { Sale } from './entities/sale.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Sale]), UsersModule, ProductsModule],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
