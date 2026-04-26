import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.sales)
  user!: User;

  @ManyToOne(() => Product, (product) => product.sales)
  product!: Product;

  @CreateDateColumn()
  createdAt!: Date;
}
