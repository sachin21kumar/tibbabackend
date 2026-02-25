import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './products.schema';
import { TranslationService } from '../common/translation/translation.service';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import axios from 'axios';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly translationService: TranslationService,
  ) {
    if (!fs.existsSync('./uploads/csv'))
      fs.mkdirSync('./uploads/csv', { recursive: true });
    if (!fs.existsSync('./uploads/images'))
      fs.mkdirSync('./uploads/images', { recursive: true });
  }

  // IMAGE DOWNLOAD
  private async downloadImage(url: string): Promise<string> {
    try {
      let name = path.basename(url).split('?')[0];
      name = name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
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
      return '';
    }
  }

  // CSV IMPORT (MULTILINGUAL NOW)
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
            price: parseFloat(data.price),
            categoryId: new Types.ObjectId(data.categoryId.trim()),
            imageUrl: data.imageUrl?.trim() || '',
            name: data.name.trim(),
            description: data.description?.trim() || '',
          });
        })
        .on('end', async () => {
          try {
            for (const item of results) {
              if (item.imageUrl) {
                item.imagePath = await this.downloadImage(item.imageUrl);
              } else {
                item.imagePath = '';
              }

              // 🔥 AUTO TRANSLATE
              const arName = await this.translationService.toArabic(item.name);
              const arDesc = await this.translationService.toArabic(item.description);

              item.translations = {
                en: { name: item.name, description: item.description },
                ar: { name: arName, description: arDesc },
              };

              delete item.name;
              delete item.description;
              delete item.imageUrl;
            }

            const inserted = await this.productModel.insertMany(results);

            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

            resolve({
              message: 'Products created',
              count: inserted.length,
              data: inserted,
            });
          } catch (err) {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            reject(
              new BadRequestException('Failed to save products: ' + err.message),
            );
          }
        })
        .on('error', (err) => {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          reject(new BadRequestException(err.message));
        });
    });
  }

  // GET PRODUCTS (LANGUAGE AWARE)
 async getProducts(
  locale: string = 'en',
  categoryId?: string,
  name?: string,
  page: number = 1,
  limit: number = 9,
  sortBy: 'price' | 'name' = 'price',
  order: 'asc' | 'desc' = 'asc',
) {
  const filter: any = {};

  // category filter
  if (categoryId && categoryId !== 'undefined' && categoryId !== 'null') {
    filter.categoryId = new Types.ObjectId(categoryId);
  }

  // search filter (search both languages)
  if (name && typeof name === 'string' && name.trim() !== '') {
    const regex = { $regex: name.trim(), $options: 'i' };
    filter.$or = [
      { 'translations.en.name': regex },
      { 'translations.ar.name': regex },
    ];
  }

  const sortOption: any = {};
  sortOption[sortBy] = order === 'asc' ? 1 : -1;

  const total = await this.productModel.countDocuments(filter);

  const products = await this.productModel
    .find(filter)
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // ⭐ AUTO TRANSLATION ENGINE
  const localized:any = [];

  for (const p of products as any[]) {

    let translation = p.translations?.[locale];

    // If Arabic requested and not translated yet
    if (
      locale === 'ar' &&
      (
        !translation ||
        translation.name === p.translations?.en?.name // same as english = not translated
      )
    ) {
      try {

        // translate once
        const arName = await this.translationService.toArabic(
          p.translations.en.name,
        );

        const arDesc = await this.translationService.toArabic(
          p.translations.en.description || '',
        );

        // save permanently in database
        await this.productModel.updateOne(
          { _id: p._id },
          {
            $set: {
              'translations.ar.name': arName,
              'translations.ar.description': arDesc,
            },
          },
        );

        translation = { name: arName, description: arDesc };

        console.log('Auto translated product:', arName);

      } catch (err) {
        // fallback if google fails
        translation = p.translations.en;
      }
    }

    // fallback safety
    if (!translation) translation = p.translations.en;

    localized.push({
      _id: p._id,
      name: translation?.name,
      description: translation?.description,
      price: p.price,
      imagePath: p.imagePath,
      categoryId: p.categoryId,
    });
  }

  return { data: localized, total, page, limit };
}

  // GET SINGLE PRODUCT
  async getProductById(id: string, locale: string = 'en') {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid product ID');

    const product: any = await this.productModel.findById(id).lean();
    if (!product) throw new NotFoundException('Product not found');

    const t = product.translations?.[locale] || product.translations?.en;

    return {
      _id: product._id,
      name: t?.name,
      description: t?.description,
      price: product.price,
      imagePath: product.imagePath,
      categoryId: product.categoryId,
    };
  }

  // CREATE PRODUCT (MANUAL)
  async createProduct(data: any, image?: any) {
    if (!data.name || !data.price || !data.categoryId) {
      throw new BadRequestException('name, price and categoryId are required');
    }

    const cleanName = data.name.trim();
    const cleanDesc = data.description?.trim() || '';

    const arName = await this.translationService.toArabic(cleanName);
    const arDesc = await this.translationService.toArabic(cleanDesc);

    return this.productModel.create({
      price: parseFloat(data.price),
      categoryId: new Types.ObjectId(data.categoryId),
      imagePath: image ? image.filename : '',
      translations: {
        en: { name: cleanName, description: cleanDesc },
        ar: { name: arName, description: arDesc },
      },
    });
  }

  // DELETE
  async deleteProduct(id: string) {
    const product = await this.productModel.findByIdAndDelete(id);
    if (!product) throw new NotFoundException('Product not found');

    return { message: 'Product deleted successfully' };
  }

  // UPDATE PRODUCT
  async updateProduct(id: string, body: any, image?: any) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid product ID');

    const product: any = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    if (image && product.imagePath) {
      const oldPath = path.join('./uploads/images', product.imagePath);
      fs.existsSync(oldPath) && fs.unlinkSync(oldPath);
      product.imagePath = image.filename;
    }

    if (body.name) {
      const cleanName = body.name.trim();
      const arName = await this.translationService.toArabic(cleanName);
      product.translations.en.name = cleanName;
      product.translations.ar.name = arName;
    }

    if (body.description) {
      const cleanDesc = body.description.trim();
      const arDesc = await this.translationService.toArabic(cleanDesc);
      product.translations.en.description = cleanDesc;
      product.translations.ar.description = arDesc;
    }

    if (body.price) product.price = parseFloat(body.price);
    if (body.categoryId)
      product.categoryId = new Types.ObjectId(body.categoryId);

    await product.save();

    return {
      message: 'Product updated successfully',
      product,
    };
  }
}