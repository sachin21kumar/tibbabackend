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
  Headers,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductService } from './products.service';
import { CreateProductDto } from './products.dto';
import * as fs from 'fs';
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('upload-file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dir = './uploads/csv';

          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          cb(null, dir);
        },
        filename: (req, file, cb) => {
          cb(null, Date.now() + '-' + file.originalname);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowed = ['.csv', '.xlsx', '.xls'];
        const ext = extname(file.originalname).toLowerCase();

        if (!allowed.includes(ext)) {
          return cb(
            new BadRequestException('Only CSV, XLSX, or XLS files are allowed'),
            false,
          );
        }

        cb(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('File is required');

    return this.productService.importProducts(file);
  }

  @Get()
  async getProducts(
    @Query('categoryId') categoryId?: string,
    @Query('name') name?: string,
    @Query('locationId') locationId?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '9',
    @Query('sortBy') sortBy: 'price' | 'name' = 'price',
    @Query('order') order: 'asc' | 'desc' = 'asc',
    @Query('locale') queryLocale?: string,
    @Headers('x-locale') headerLocale?: string,
  ) {
    const locale = queryLocale || headerLocale || 'en';

    return this.productService.getProducts(
      locale,
      categoryId,
      name,
      locationId,
      Number(page) || 1,
      Number(limit) || 9,
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
    @Body() body: CreateProductDto,
    @UploadedFile() image?: any,
  ) {
    return this.productService.createProduct(body, image);
  }
  l;

  @Get(':id')
  async getProduct(
    @Param('id') id: string,
    @Query('locale') queryLocale?: string,
    @Headers('x-locale') headerLocale?: string,
  ) {
    const locale = queryLocale || headerLocale || 'en';

    return this.productService.getProductById(id, locale);
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
  deleteProduct(
    @Param('id') id: string,
    @Query('locationId') locationId?: string,
  ) {
    return this.productService.deleteProduct(id, locationId);
  }
}
