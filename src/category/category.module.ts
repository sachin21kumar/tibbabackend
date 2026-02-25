import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category, CategorySchema } from './category.schema';
import { TranslationModule } from 'src/common/translation/translation.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    TranslationModule
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService, MongooseModule],
})
export class CategoryModule {}
