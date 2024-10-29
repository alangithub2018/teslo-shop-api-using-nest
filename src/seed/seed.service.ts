import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { initialData } from './data/seed-data';
import { ProductsService } from '../products/products.service';
import { User } from 'src/auth/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {

  constructor(
    private ProductsService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  
  async runSeed() {
    await this.deleteTables();

    const firstUser = await this.insertUsers();

    await this.insertNewProducts(firstUser);
    return 'Seed executed';
  }

  private async deleteTables() {
    await this.ProductsService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute();
  }

  private async insertUsers() {
    await this.userRepository.delete({});

    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach((user) => {
      // encrypt password
      user.password = bcrypt.hashSync(user.password, 10);
      users.push(this.userRepository.create(user));
    });

    await this.userRepository.save(users);

    return users[0];
  }

  private async insertNewProducts(user: User) {
    await this.ProductsService.deleteAllProducts();

    const seedProducts = initialData.products;

    const insertPromises = [];

    seedProducts.forEach((product) => {
       insertPromises.push(this.ProductsService.create(product, user));
    });

    await Promise.all(insertPromises);

    return true;
  }

}
