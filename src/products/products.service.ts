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
import * as XLSX from 'xlsx';
import axios from 'axios';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {
    if (!fs.existsSync('./uploads/csv'))
      fs.mkdirSync('./uploads/csv', { recursive: true });

    if (!fs.existsSync('./uploads/products'))
      fs.mkdirSync('./uploads/products', { recursive: true });
  }

  private async downloadImage(url: string): Promise<string> {
    try {
      let name = path.basename(url).split('?')[0];
      name = name.replace(/[^a-zA-Z0-9.\-_]/g, '_');

      const filename = Date.now() + '-' + name;
      const imagePath = path.join('./uploads/products', filename);

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

  ensureUploadFolders() {
    const csvPath = './uploads/csv';
    const imagePath = './uploads/products';

    if (!fs.existsSync(csvPath)) {
      fs.mkdirSync(csvPath, { recursive: true });
    }

    if (!fs.existsSync(imagePath)) {
      fs.mkdirSync(imagePath, { recursive: true });
    }
  }

  async importProducts(file: any) {
    this.ensureUploadFolders();
    if (!file) throw new BadRequestException('File is required');

    const ext = path.extname(file.originalname).toLowerCase();

    let rows: any[] = [];

    if (ext === '.csv') {
      rows = await new Promise((resolve, reject) => {
        const results: any[] = [];

        fs.createReadStream(file.path)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => resolve(results))
          .on('error', reject);
      });
    } else if (ext === '.xlsx' || ext === '.xls') {
      const workbook = XLSX.readFile(file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(sheet);
    } else {
      throw new BadRequestException('Unsupported file format');
    }

    const products: any[] = [];

    for (const row of rows) {
      const name = String(row.name || '').trim();
      const price = row.price !== undefined ? Number(row.price) : undefined;
      const categoryId = String(row.categoryId || '').trim();
      const subCategoryId = row.subCategoryId
        ? String(row.subCategoryId).trim()
        : null;

      if (!name || price === undefined || !categoryId) {
        throw new BadRequestException(
          'name, price and categoryId are required in file',
        );
      }

      if (!Types.ObjectId.isValid(categoryId)) {
        throw new BadRequestException(`Invalid categoryId: ${categoryId}`);
      }

      let mongoSubCategoryId: any = undefined;

      if (subCategoryId && Types.ObjectId.isValid(subCategoryId)) {
        mongoSubCategoryId = new Types.ObjectId(subCategoryId);
      }

      let imagePath = '';

      if (row.imageUrl) {
        imagePath = await this.downloadImage(String(row.imageUrl).trim());
      }

      products.push({
        price,
        categoryId: new Types.ObjectId(categoryId),
        subCategoryId: mongoSubCategoryId,
        imagePath,

        locationIds: row.locationIds
          ? String(row.locationIds)
              .split(',')
              .map((id) => id.trim())
              .filter((id) => Types.ObjectId.isValid(id))
              .map((id) => new Types.ObjectId(id))
          : [],

        foodType: row.foodType,
        taxProductGroup: row.taxProductGroup || 'food',
        kitchenDept: row.kitchenDept,
        stock: row.stock ? Number(row.stock) : 0,
        preparationTime: row.preparationTime ? Number(row.preparationTime) : 0,
        isActive: row.isActive ?? 1,
        itemType: row.itemType ?? 0,
        platformStatus: row.platformStatus ?? 1,
        syncToAggregator: row.syncToAggregator ?? 0,

        salePrice1: row.salePrice1 ?? 0,
        salePrice2: row.salePrice2 ?? 0,
        salePrice3: row.salePrice3 ?? 0,
        salePrice4: row.salePrice4 ?? 0,
        salePrice5: row.salePrice5 ?? 0,

        translations: {
          en: {
            name,
            description: row.description ? String(row.description) : '',
          },
          ar: {
            name: row.nameAr ? String(row.nameAr) : '',
            description: row.descriptionAr ? String(row.descriptionAr) : '',
          },
        },
      });
    }

    const inserted = await this.productModel.insertMany(products);

    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    return {
      message: 'Products imported successfully',
      count: inserted.length,
      data: inserted,
    };
  }

  async getProducts(
    locale: string = 'en',
    categoryId?: string,
    name?: string,
    locationId?: string,
    page: number = 1,
    limit: number = 9,
    sortBy: 'price' | 'name' = 'price',
    order: 'asc' | 'desc' = 'asc',
  ) {
    const filter: any = {};

    if (categoryId && Types.ObjectId.isValid(categoryId)) {
      filter.categoryId = new Types.ObjectId(categoryId);
    }

    if (locationId && Types.ObjectId.isValid(locationId)) {
      filter.locationIds = new Types.ObjectId(locationId);
    }

    if (name && name.trim() !== '') {
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

    const localized: any[] = [];

    for (const p of products as any[]) {
      let translation = p.translations?.[locale];

      if (!translation || !translation.name) {
        translation = p.translations?.en;
      }

      localized.push({
        _id: p._id,
        name: translation?.name,
        description: translation?.description,
        price: p.price,
        imagePath: p.imagePath,
        categoryId: p.categoryId,
        locationIds: p.locationIds,
        isActive: p.isActive,
      });
    }

    return { data: localized, total, page, limit };
  }

  async getProductById(id: string, locale: string = 'en') {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product: any = await this.productModel.findById(id).lean();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let t = product.translations?.[locale];

    if (!t || !t.name) {
      t = product.translations?.en;
    }

    return {
      _id: product._id,
      name: t?.name,
      description: t?.description,
      price: product.price,
      stock: product.stock,
      isActive: product.isActive,
      imagePath: product.imagePath,
      categoryId: product.categoryId,
      locationIds: product.locationIds,
      translations: product.translations,
    };
  }

  async createProduct(data: any, image?: any) {
    if (!data.name || data.price === undefined || !data.categoryId) {
      throw new BadRequestException('name, price and categoryId are required');
    }

    if (!Types.ObjectId.isValid(data.categoryId)) {
      throw new BadRequestException('Invalid categoryId');
    }

    return this.productModel.create({
      price: Number(data.price),

      categoryId: new Types.ObjectId(data.categoryId),

      subCategoryId:
        data.subCategoryId && Types.ObjectId.isValid(data.subCategoryId)
          ? new Types.ObjectId(data.subCategoryId)
          : undefined,

      locationIds: Array.isArray(data.locationIds)
        ? data.locationIds
            .filter((id) => Types.ObjectId.isValid(id))
            .map((id) => new Types.ObjectId(id))
        : [],

      imagePath: image ? image.filename : '',

      foodType: data.foodType,
      taxProductGroup: data.taxProductGroup || 'food',
      kitchenDept: data.kitchenDept,
      stock: data.stock ? Number(data.stock) : 0,

      preparationTime: data.preparationTime ? Number(data.preparationTime) : 0,

      isActive: data.isActive ?? 1,
      itemType: data.itemType ?? 0,
      platformStatus: data.platformStatus ?? 1,
      syncToAggregator: data.syncToAggregator ?? 0,

      salePrice1: data.salePrice1 ?? 0,
      salePrice2: data.salePrice2 ?? 0,
      salePrice3: data.salePrice3 ?? 0,
      salePrice4: data.salePrice4 ?? 0,
      salePrice5: data.salePrice5 ?? 0,

      translations: {
        en: {
          name: data.name.trim(),
          description: data.description?.trim() || '',
        },
        ar: {
          name: data.nameAr?.trim() || '',
          description: data.descriptionAr?.trim() || '',
        },
      },
    });
  }

  async deleteProduct(id: string, locationId?: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(id);

    if (!product) throw new NotFoundException('Product not found');

    // If locationId provided, just remove that location from the product
    if (locationId) {
      if (!Types.ObjectId.isValid(locationId)) {
        throw new BadRequestException('Invalid locationId');
      }

      const locationObjectId = new Types.ObjectId(locationId);

      const exists = (product.locationIds as Types.ObjectId[]).some((loc) =>
        loc.equals(locationObjectId),
      );

      if (!exists) {
        throw new NotFoundException('Location not found in this product');
      }

      await this.productModel.findByIdAndUpdate(id, {
        $pull: { locationIds: locationObjectId },
      });

      return { message: 'Location removed from product successfully' };
    }

    // No locationId provided — delete the entire product
    await this.productModel.findByIdAndDelete(id);

    return { message: 'Product deleted successfully' };
  }

  async updateProduct(id: string, body: any, image?: any) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid product ID');

    const product: any = await this.productModel.findById(id);

    if (!product) throw new NotFoundException('Product not found');

    if (image) {
      product.imagePath = image.filename;
    }

    const currentTranslations = product.translations || {
      en: { name: '', description: '' },
      ar: { name: '', description: '' },
    };

    product.translations = {
      en: {
        name:
          body.nameEn !== undefined
            ? body.nameEn.trim()
            : currentTranslations.en?.name,
        description:
          body.description !== undefined
            ? body.description.trim()
            : currentTranslations.en?.description,
      },
      ar: {
        name:
          body.nameAr !== undefined
            ? body.nameAr.trim()
            : currentTranslations.ar?.name,
        description:
          body.descriptionAr !== undefined
            ? body.descriptionAr.trim()
            : currentTranslations.ar?.description,
      },
    };

    if (body.price !== undefined) product.price = Number(body.price);

    if (
      body.categoryId !== undefined &&
      Types.ObjectId.isValid(body.categoryId)
    )
      product.categoryId = new Types.ObjectId(body.categoryId);

    if (
      body.subCategoryId !== undefined &&
      Types.ObjectId.isValid(body.subCategoryId)
    )
      product.subCategoryId = new Types.ObjectId(body.subCategoryId);

    if (body.locationIds !== undefined && Array.isArray(body.locationIds)) {
      product.locationIds = body.locationIds
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id));
    }

    if (body.foodType !== undefined) product.foodType = body.foodType;

    if (body.taxProductGroup !== undefined)
      product.taxProductGroup = body.taxProductGroup;

    if (body.kitchenDept !== undefined) product.kitchenDept = body.kitchenDept;

    if (body.stock !== undefined) product.stock = Number(body.stock);

    if (body.preparationTime !== undefined)
      product.preparationTime = Number(body.preparationTime);

    if (body.isActive !== undefined)
      product.isActive =
        body.isActive === '1' || body.isActive === 1 || body.isActive === true;

    if (body.itemType !== undefined) product.itemType = body.itemType;

    if (body.platformStatus !== undefined)
      product.platformStatus = body.platformStatus;

    if (body.syncToAggregator !== undefined)
      product.syncToAggregator = body.syncToAggregator;

    if (body.salePrice1 !== undefined) product.salePrice1 = body.salePrice1;
    if (body.salePrice2 !== undefined) product.salePrice2 = body.salePrice2;
    if (body.salePrice3 !== undefined) product.salePrice3 = body.salePrice3;
    if (body.salePrice4 !== undefined) product.salePrice4 = body.salePrice4;
    if (body.salePrice5 !== undefined) product.salePrice5 = body.salePrice5;

    await product.save();

    return {
      message: 'Product updated successfully',
      product,
    };
  }
}
