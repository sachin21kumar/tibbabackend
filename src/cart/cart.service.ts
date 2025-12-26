import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from './cart.schema';

@Injectable()
export class CartService {
  constructor(
       @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,

  ) {}

  async getCart() {
    const cart = await this.cartModel
      .findOne()
      .populate('items.productId')
      .lean();

    if (!cart) {
      return { items: [], totalPrice: 0 };
    }

    const totalPrice = cart.items.reduce((total, item: any) => {
      return total + (item.productId?.price || 0) * item.quantity;
    }, 0);

    return { ...cart, totalPrice };
  }

  async addToCart(productId: string, quantity = 1) {
    const productObjectId = new Types.ObjectId(productId);
    let cart = await this.cartModel.findOne();

    if (!cart) {
      cart = await this.cartModel.create({
        items: [{ productId: productObjectId, quantity }],
      });
      return cart;
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity; // ✅ ADD
    } else {
      cart.items.push({ productId: productObjectId, quantity });
    }

    await cart.save();
    return cart;
  }

  async updateCart(productId: string, quantity: number) {
    const cart = await this.cartModel.findOne();
    if (!cart) return null;

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity; // ✅ SET
      await cart.save();
    }

    return cart;
  }

  async removeFromCart(productId: string) {
    return this.cartModel.findOneAndUpdate(
      {},
      { $pull: { items: { productId: new Types.ObjectId(productId) } } },
      { new: true },
    );
  }

  async clearCart() {
    return this.cartModel.findOneAndDelete({});
  }

  async getCartItemByProductId(productId: string) {
    return this.cartModel.findOne(
      { "items.productId": new Types.ObjectId(productId) },
      { "items.$": 1 } 
    );
  }
}
