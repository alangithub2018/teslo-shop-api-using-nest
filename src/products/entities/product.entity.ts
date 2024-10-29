import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { User } from 'src/auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

// it represents an object into the database
@Entity({ name: 'products' })
export class Product {

    @ApiProperty({
        example: 'd3c2c4c6-3e6f-4b4b-8e0c-2c7a4c6c3e6f',
        description: 'The unique identifier of the product',
        format: 'uuid',
        uniqueItems: true,
        readOnly: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // not all of the database types are supported by any database
    @ApiProperty({
        example: 'T-shirt',
        description: 'The title of the product',
        type: 'string',
        uniqueItems: true
    })
    @Column('text', { unique: true })
    title: string;

    @ApiProperty({
        example: 10.99,
        description: 'The price of the product',
        type: 'number',
        format: 'float'
    })
    @Column('float', { default: 0 })
    price: number;

    @ApiProperty({
        example: 'A beautiful t-shirt for you',
        description: 'The description of the product',
        type: 'string',
        nullable: true
    })
    @Column({ type: 'text', nullable: true,})
    description: string;

    @ApiProperty({
        example: 't-shirt',
        description: 'The slug of the product',
        type: 'string',
        uniqueItems: true
    })
    @Column('text', {unique: true})
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'The stock of the product',
        type: 'number',
        format: 'int',
        default: 0
    })
    @Column('int', { default: 0 })
    stock: number;

    @ApiProperty({
        example: ['red', 'blue', 'green'],
        description: 'The colors of the product',
        type: 'array',
        items: {
            type: 'string'
        }
    })
    @Column('text', { array: true })
    sizes: string[];

    @ApiProperty({
        example: 'women',
        description: 'Gender of the product',
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example: ['t-shirt', 'clothes', 'fashion'],
        description: 'The tags of the product',
        type: 'array',
        items: {
            type: 'string'
        }
    })
    @Column('text', { 
        array: true,
        default: []
    })
    tags: string[];

    @ApiProperty()
    @OneToMany(
        () => ProductImage,
        image => image.product, 
        {cascade: true, eager: true}
    )
    images?: ProductImage[];

    @ManyToOne(
        // Table to relate
        () => User,
        // column to relate
        user => user.product,
        // eager loading
        {eager: true}
    )
    user: User;

    @BeforeInsert()
    checkSlugInsert() {

        if (!this.slug) this.slug = this.title;

        this.slug = this.slug
            .toLowerCase()
            .replace(/ /g, '_')
            .replace(/'/g, '');

        if (this.tags) this.tags = this.tags.map(tag => tag.toLowerCase().replace(/ /g, '_').replace(/'/g, ''));
 
    }

    @BeforeUpdate()
    checkSlugUpdate() {

        this.slug = this.slug
            .toLowerCase()
            .replace(/ /g, '_')
            .replace(/'/g, '');

        if (this.tags) this.tags = this.tags.map(tag => tag.toLowerCase().replace(/ /g, '_').replace(/'/g, ''));

    }

}
