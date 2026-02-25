import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './category.schema';
import { CreateCategoryDto } from './category.dto';
import { TranslationService } from '../common/translation/translation.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,
    private readonly translationService: TranslationService,
  ) {}

  // CREATE CATEGORY
  async createCategory(createCategoryDto: CreateCategoryDto) {
    const { title } = createCategoryDto;

    if (!title) {
      throw new BadRequestException('Category title is required.');
    }

    const cleanTitle = String(title).trim();

    // duplicate check (english base language)
    const exists = await this.categoryModel.findOne({
      'translations.en.title': cleanTitle,
    });

    if (exists) {
      throw new BadRequestException('Category already exists.');
    }

    // auto arabic translation
    const arabicTitle = await this.translationService.toArabic(cleanTitle);

    const category = await this.categoryModel.create({
      translations: {
        en: { title: cleanTitle },
        ar: { title: arabicTitle },
      },
    });

    return {
      message: 'Category created successfully',
      data: category,
    };
  }

  // GET CATEGORY (FIXED)
  async getCategory(
    locale: string = 'en',
    search?: any,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    let query: any = {};

    // ---- SAFE SEARCH HANDLING ----
    const searchText =
      typeof search === 'string' ? search.trim() : '';
    if (searchText !== '') {
      const regex = { $regex: searchText, $options: 'i' };
      // search in BOTH languages (important)
      query = {
        $or: [
          { 'translations.en.title': regex },
          { 'translations.ar.title': regex },
        ],
      };
    }

    const categories = await this.categoryModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .lean();
    // ---- LANGUAGE FALLBACK RESOLVER ----
    const result = categories.map((cat: any) => {
      let title = '';
      if (locale === 'ar') {
        // arabic user
        title =
          cat.translations?.ar?.title ||
          cat.translations?.en?.title ||
          'No Title';
      } else {
        // english user
        title =
          cat.translations?.en?.title ||
          cat.translations?.ar?.title ||
          'No Title';
      }

      return {
        _id: cat._id,
        imageUrl: cat.imageUrl,
        title,
      };
    });
    return { data: result, page, limit };
  }

  // UPDATE CATEGORY
  async updateCategory(title: string, id: string) {
    if (!title) {
      throw new BadRequestException('Title is required');
    }

    const cleanTitle = String(title).trim();

    // retranslate
    const arabicTitle = await this.translationService.toArabic(cleanTitle);

    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            'translations.en.title': cleanTitle,
            'translations.ar.title': arabicTitle,
          },
        },
        { new: true },
      )
      .lean();

    if (!updatedCategory) {
      throw new BadRequestException('Category does not exist.');
    }

    return {
      message: 'Category updated successfully',
      data: updatedCategory,
    };
  }

  // DELETE CATEGORY
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