import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import {validate as IsUUID} from 'uuid';

import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  // As an advice it is recommended to use the repository pattern to interact with the database
  // This is a good practice to separate the business logic from the data access logic
  // This way the code is more organized and easier to maintain
  // To implement this pattern you can inject the repository in the service
  // For example:
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    
    try {

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({ url: image })),
        user,
      });

      await this.productRepository.save(product);

      return {...product, images};

    } catch (error) {
      this.handleDBException(error);
    }

  }

  // TODO: paginate the results
  async findAll(paginationDto: PaginationDto) {

    // destructuring the object to get the limit and offset properties
    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      // TODO: configure table relationships
      relations: {
        images: true,
      },
    });

    return products.map(({images, ...rest}) => ({
      ...rest,
      images: images.map( img => img.url)
    }))
  }

  async findOne(term: string) {

    let product: Product;
    if (IsUUID(term)) {
      product = await this.productRepository.findOneBy({id: term});
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
      // Use postgres function to make it insensitive to case
        .where('LOWER(title) = LOWER(:title) or slug = :slug', {
          title: term.toLowerCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`Product with ${term} not found`);
    }
    return product;
    
  }

  async findOnePlain(term: string) {
    const {images = [], ...rest } = await this.findOne(term);
    return {...rest, images: images.map(img => img.url)};
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    
    const {images, ...toUpdate} = updateProductDto;

    const product = await this.productRepository.preload({id, ...toUpdate });

    if (!product) throw new NotFoundException(`Product with id ${id} not found`);

    // Create query runner to handle transactions
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();


    try {

      // If images are provided, update the images
      if (images) {
        await queryRunner.manager.delete(ProductImage, {product: {id}});
        product.images = images.map(
          image => this.productImageRepository.create({url: image})
        );
      }

      // who is updating the product
      product.user = user;
      await queryRunner.manager.save(product);

      // return await this.productRepository.save(product);
      // If no errors, commit the transaction
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);
    } catch (error) {

      // If any error occurs, rollback the transaction
      await queryRunner.rollbackTransaction();
      // Release the query runner to avoid memory leaks
      await queryRunner.release();

      this.handleDBException(error);
    }

  }

  async remove(id: string) {
    const product = await this.findOne(id);
    // remove product and images in cascade
    return await this.productRepository.remove(product);
  }

  private handleDBException(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error.message);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

  async deleteAllProducts () {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
      .delete()
      .where({})
      .execute();
    } catch (error) {
      this.handleDBException(error);
    }

  }
}
