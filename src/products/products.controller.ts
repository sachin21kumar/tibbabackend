import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ProductService } from './products.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('upload-csv')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/csv',
        filename: (req, file, cb) =>
          cb(null, Date.now() + '-' + file.originalname),
      }),
    }),
  )
  async uploadCsv(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('CSV file is required.');
    return this.productService.createProductsFromCsv(file);
  }

  @Get()
  async getProducts(
    @Query('categoryId') categoryId?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '9',
    @Query('sortBy') sortBy: 'price' | 'name' = 'price',
    @Query('order') order: 'asc' | 'desc' = 'asc',
  ) {
    return this.productService.getProducts(
      categoryId,
      parseInt(page),
      parseInt(limit),
      sortBy,
      order,
    );
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, cb) =>
          cb(null, Date.now() + '-' + file.originalname),
      }),
    }),
  )
  async createProduct(
    @Body() body: any,
    @UploadedFile() image?: any,
  ) {
    return this.productService.createProduct(body, image);
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

 @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, cb) =>
          cb(null, Date.now() + '-' + file.originalname),
      }),
    }),
  )
  async updateProduct(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() image?: any,
  ) {
    return this.productService.updateProduct(id, body, image);
  }


   @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}
