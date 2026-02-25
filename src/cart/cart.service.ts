import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from './cart.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
  ) {}

  // ⭐ GET CART (LOCALE AWARE)
  async getCart(locationId: string, locale: string = 'en') {
    const cart = await this.cartModel
      .findOne({ locationId: new Types.ObjectId(locationId) })
      .populate('items.productId')
      .lean();

    if (!cart) {
      return { items: [], totalPrice: 0 };
    }

    // ---- LOCALIZE PRODUCTS ----
    for (const item of cart.items as any[]) {
      const product = item.productId;
      if (!product) continue;

      // choose translation
      const translation =
        product.translations?.[locale] || product.translations?.en;

      // inject dynamic fields
      product.name = translation?.name || '';
      product.description = translation?.description || '';
    }

    // calculate total
    const totalPrice = cart.items.reduce((total, item: any) => {
      return total + (item.productId?.price || 0) * item.quantity;
    }, 0);

    return { ...cart, totalPrice };
  }

  // ADD TO CART
  async addToCart(productId: string, quantity = 1, locationId: string) {
    const productObjectId = new Types.ObjectId(productId);
    const locationObjectId = new Types.ObjectId(locationId);

    let cart = await this.cartModel.findOne({ locationId: locationObjectId });

    if (!cart) {
      cart = await this.cartModel.create({
        locationId: locationObjectId,
        items: [{ productId: productObjectId, quantity }],
      });
      return cart;
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId: productObjectId, quantity });
    }

    await cart.save();
    return cart;
  }

  // UPDATE CART ITEM
  async updateCart(productId: string, quantity: number) {
    const cart = await this.cartModel.findOne();
    if (!cart) return null;

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (itemIndex === -1) return cart;

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    if (cart.items.length === 0) {
      await this.cartModel.findByIdAndDelete(cart._id);
      return null;
    }

    await cart.save();
    return cart;
  }

  // REMOVE ITEM
  async removeFromCart(productId: string) {
    const cart = await this.cartModel.findOne();
    if (!cart) return null;

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );

    if (cart.items.length === 0) {
      await this.cartModel.findByIdAndDelete(cart._id);
      return null;
    }

    await cart.save();
    return cart;
  }

  // CLEAR CART
  async clearCart() {
    return this.cartModel.findOneAndDelete({});
  }

  // GET SINGLE ITEM
  async getCartItemByProductId(productId: string) {
    return this.cartModel.findOne(
      { 'items.productId': new Types.ObjectId(productId) },
      { 'items.$': 1 },
    );
  }
}