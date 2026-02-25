import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductService } from './products.service';
import { ProductController } from './products.controller';
import { Product, ProductSchema } from './products.schema';
import { Category, CategorySchema } from '../category/category.schema';
import { TranslationModule } from 'src/common/translation/translation.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    TranslationModule
  ],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductsModule {}
