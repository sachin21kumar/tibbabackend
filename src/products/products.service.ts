import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './products.schema';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import axios from 'axios';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {
    // Ensure folders exist
    if (!fs.existsSync('./uploads/csv'))
      fs.mkdirSync('./uploads/csv', { recursive: true });
    if (!fs.existsSync('./uploads/images'))
      fs.mkdirSync('./uploads/images', { recursive: true });
  }

  private async downloadImage(url: string): Promise<string> {
    try {
      let name = path.basename(url).split('?')[0]; // remove query params
      name = name.replace(/[^a-zA-Z0-9.\-_]/g, '_'); // sanitize
      const filename = Date.now() + '-' + name;
      const imagePath = path.join('./uploads/images', filename);

      const writer = fs.createWriteStream(imagePath);
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
      });
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filename));
        writer.on('error', reject);
      });
    } catch {
      return ''; // fail silently if download fails
    }
  }

  async createProductsFromCsv(file: any) {
    if (!file) throw new BadRequestException('CSV file is required.');

    const results: any[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(file.path)
        .pipe(csv())
        .on('data', (data) => {
          if (!data.name || !data.price || !data.categoryId) {
            return reject(
              new BadRequestException(
                'Missing name, price, or categoryId in CSV.',
              ),
            );
          }

          results.push({
            name: data.name.trim(),
            price: parseFloat(data.price),
            description: data.description?.trim() || '',
            categoryId: new Types.ObjectId(data.categoryId.trim()),
            imageUrl: data.imageUrl?.trim() || '',
          });
        })
        .on('end', async () => {
          try {
            // Download images in parallel
            await Promise.all(
              results.map(async (item) => {
                if (item.imageUrl) {
                  item.imagePath = await this.downloadImage(item.imageUrl);
                } else {
                  item.imagePath = '';
                }
                delete item.imageUrl;
              }),
            );

            const inserted = await this.productModel.insertMany(results);

            // Delete CSV file after processing
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

            resolve({
              message: 'Products created',
              count: inserted.length,
              data: inserted,
            });
          } catch (err) {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            reject(
              new BadRequestException(
                'Failed to save products: ' + err.message,
              ),
            );
          }
        })
        .on('error', (err) => {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          reject(new BadRequestException(err.message));
        });
    });
  }

 async getProducts(
  categoryId?: string,
  name?: string,
  page: number = 1,
  limit: number = 9,
  sortBy: 'price' | 'name' = 'price',
  order: 'asc' | 'desc' = 'asc',
) {
  const filter: any = {};

  if (categoryId && categoryId !== 'undefined' && categoryId !== 'null') {
    filter.categoryId = new Types.ObjectId(categoryId);
  }

  if (name && name.trim() !== '') {
    filter.name = { $regex: name.trim(), $options: 'i' };
  }

  // ✅ Default: insertion order (oldest first)
  const sortOption: any = {};

  // Apply sorting ONLY when filter or explicit sort is used
  const hasFilter = Object.keys(filter).length > 0;

  if (hasFilter || sortBy !== 'price' || order !== 'asc') {
    sortOption[sortBy] = order === 'asc' ? 1 : -1;
  } else {
    // fallback to insertion order
    sortOption._id = 1;
  }

  const total = await this.productModel.countDocuments(filter);
  const products = await this.productModel
    .find(filter)
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return { data: products, total, page, limit };
}



  async getProductById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }
    const product = await this.productModel.findById(id).lean();
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    return product;
  }

  async createProduct(data: any, image?: any) {
    if (!data.name || !data.price || !data.categoryId) {
      throw new BadRequestException('name, price and categoryId are required');
    }

    return this.productModel.create({
      name: data.name.trim(),
      price: parseFloat(data.price),
      description: data.description?.trim() || '',
      categoryId: new Types.ObjectId(data.categoryId),
      imagePath: image ? image.filename : '',
    });
  }

  /* ================= DELETE PRODUCT ================= */
  async deleteProduct(id: string) {
    const product = await this.productModel.findByIdAndDelete(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      message: 'Product deleted successfully',
    };
  }

  async updateProduct(id: string, body: any, image?: any) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid product ID');

    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    // 🔥 Delete old image if new uploaded
    if (image && product.imagePath) {
      const oldPath = path.join('./uploads/products', product.imagePath);
      fs.existsSync(oldPath) && fs.unlinkSync(oldPath);
      product.imagePath = image.filename;
    }

    if (body.name) product.name = body.name.trim();
    if (body.price) product.price = parseFloat(body.price);
    if (body.description) product.description = body.description.trim();
    if (body.categoryId)
      product.categoryId = new Types.ObjectId(body.categoryId);

    await product.save();

    return {
      message: 'Product updated successfully',
      product,
    };
  }
}
