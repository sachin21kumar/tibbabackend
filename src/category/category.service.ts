import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './category.schema';
import { CreateCategoryDto } from './category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const { title } = createCategoryDto;

    if (!title) {
      throw new BadRequestException('Category title is required.');
    }

    const exists = await this.categoryModel.findOne({ title: title.trim() });
    if (exists) {
      throw new BadRequestException('Category already exists.');
    }

    const category = new this.categoryModel({ title: title.trim() });
    const savedCategory = await category.save();

    return {
      message: 'Category created successfully',
      data: savedCategory,
    };
  }

  async getCategory(search?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const result = await this.categoryModel
      .find({
        title: { $regex: search || '', $options: 'i' },
      })
      .skip(skip)
      .limit(limit)
      .lean();

    return { data: result, page: page, limit: limit };
  }

  async updateCategory(title: string, id: string) {
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, { title }, { new: true })
      .lean();

    if (!updatedCategory) {
      throw new BadRequestException('Category does not exist.');
    }

    return updatedCategory;
  }

  async deleteCategory(id: string) {
    const deletedCategory = await this.categoryModel
      .findByIdAndDelete(id)
      .lean();

    if (!deletedCategory) {
      throw new BadRequestException('Category does not exist.');
    }

    return {
      message: 'Category deleted successfully',
    };
  }
}
