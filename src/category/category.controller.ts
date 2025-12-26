import { Controller, Get, Post, Body, Query, Put, Param, Delete } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() title: CreateCategoryDto) {
    return this.categoryService.createCategory(title);
  }

  @Get()
  async getCategory(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const pageNumber = page ? parseInt(page.toString(), 10) : 1;
    const limitNumber = limit ? parseInt(limit.toString(), 20) : 20;
    return this.categoryService.getCategory(search, pageNumber, limitNumber);
  }

  @Put(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() body: CreateCategoryDto,
  ) {
    return this.categoryService.updateCategory(body.title, id);
  }

  @Delete(":id")
  async deleteCategory(@Param('id') id:string){
return this.categoryService.deleteCategory(id)
  }
}
