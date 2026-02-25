import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Put,
  Param,
  Delete,
  Headers,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // CREATE CATEGORY
  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto);
  }

  // GET CATEGORY (NOW LANGUAGE AWARE)
  @Get()
  async getCategory(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('locale') queryLocale?: string,
    @Headers('x-locale') headerLocale?: string,
  ) {
    // locale priority: query > header > default
    const locale = queryLocale || headerLocale || 'en';

    // SAFE number parsing
    const pageNumber = Number(page) > 0 ? Number(page) : 1;
    const limitNumber = Number(limit) > 0 ? Number(limit) : 20;

    return this.categoryService.getCategory(
      locale,
      search,
      pageNumber,
      limitNumber,
    );
  }

  // UPDATE CATEGORY
  @Put(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() body: CreateCategoryDto,
  ) {
    return this.categoryService.updateCategory(body.title, id);
  }

  // DELETE CATEGORY
  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
