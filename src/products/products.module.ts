import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductImage } from './entities';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    AuthModule,
    // 👈 Add this
    TypeOrmModule.forFeature([Product, ProductImage]), // 👈 Add this
  ],
  exports: [
    ProductsService,
    TypeOrmModule
  ], // 👈 Add this
})
export class ProductsModule {}
