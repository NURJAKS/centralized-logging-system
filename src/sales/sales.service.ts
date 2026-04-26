import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Sale } from '../sales/entities/sale.entity';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
    private usersService: UsersService,
    private productsService: ProductsService,
  ) {}

  findAll(): Promise<Sale[]> {
    return this.salesRepository.find();
  }

  async findOne(id: number): Promise<Sale> {
    const sale = await this.salesRepository.findOne({ where: { id } });
    if (!sale) {
      throw new NotFoundException(`Продажа с ID ${id} не найдена`);
    }
    return sale;
  }

  async create(dto: CreateSaleDto): Promise<Sale> {
    const user = await this.usersService.findOne(dto.userId);
    const product = await this.productsService.findOne(dto.productId);

    const sale = this.salesRepository.create({
      user,
      product,
    });
    return this.salesRepository.save(sale);
  }
  async remove(id: number): Promise<string> {
    await this.findOne(id);
    await this.salesRepository.delete(id);
    return `Продажа с ID ${id} удалена`;
  }
}
