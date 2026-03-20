import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from './cart.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
  ) {}

  private async calculateCartTotals(cart: any) {
    await cart.populate('items.productId');

    const subtotal = cart.items.reduce((total, item: any) => {
      return total + (item.productId?.price || 0) * item.quantity;
    }, 0);

    let deliveryFee = 0;
    if (subtotal < 100) {
      deliveryFee = 3;
    }

    const discount = subtotal * 0.25;
    const totalPrice = subtotal - discount + deliveryFee;

    cart.subtotal = subtotal;
    cart.discount = discount;
    cart.deliveryFee = deliveryFee;
    cart.totalPrice = totalPrice;
    cart.couponCode = 'TIBBA25';

    return cart;
  }

  async getCart(locationId: string, locale: string = 'en') {
    const cart = await this.cartModel
      .findOne({ locationId: new Types.ObjectId(locationId) })
      .populate('items.productId')
      .lean();

    if (!cart) {
      return {
        items: [],
        specialInstructions: '',
        cutlery: false,
        subtotal: 0,
        discount: 0,
        deliveryFee: 0,
        totalPrice: 0,
        couponCode: 'TIBBA25',
      };
    }

    for (const item of cart.items as any[]) {
      const product = item.productId;
      if (!product) continue;

      const translation =
        product.translations?.[locale] || product.translations?.en;

      product.name = translation?.name || '';
      product.description = translation?.description || '';
    }

    return {
      ...cart,
      specialInstructions: cart.specialInstructions || '',
      cutlery: cart.cutlery || false,
      subtotal: cart.subtotal || 0,
      discount: cart.discount || 0,
      deliveryFee: cart.deliveryFee || 0,
      totalPrice: cart.totalPrice || 0,
      couponCode: cart.couponCode || 'TIBBA25',
    };
  }

  async addToCart(productId: string, quantity = 1, locationId: string) {
    const productObjectId = new Types.ObjectId(productId);
    const locationObjectId = new Types.ObjectId(locationId);

    let cart = await this.cartModel.findOne({ locationId: locationObjectId });

    if (!cart) {
      cart = await this.cartModel.create({
        locationId: locationObjectId,
        items: [{ productId: productObjectId, quantity }],
        specialInstructions: '',
        cutlery: false,
        subtotal: 0,
        discount: 0,
        deliveryFee: 0,
        totalPrice: 0,
        couponCode: 'TIBBA25',
      });

      await this.calculateCartTotals(cart);
      await cart.save();
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

    await this.calculateCartTotals(cart);
    await cart.save();
    return cart;
  }

  async updateCart(
    productId?: string,
    quantity?: number,
    specialInstructions?: string,
    cutlery?: boolean,
  ) {
    const cart = await this.cartModel.findOne();
    if (!cart) return null;

    if (specialInstructions !== undefined) {
      cart.specialInstructions = specialInstructions;
    }

    if (cutlery !== undefined) {
      cart.cutlery = cutlery;
    }
    if (productId && quantity !== undefined) {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId,
      );

      if (itemIndex !== -1) {
        if (quantity <= 0) {
          cart.items.splice(itemIndex, 1);
        } else {
          cart.items[itemIndex].quantity = quantity;
        }
      }
    }

    if (cart.items.length === 0) {
      await this.cartModel.findByIdAndDelete(cart._id);
      return null;
    }

    await this.calculateCartTotals(cart);
    await cart.save();
    return cart;
  }

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

    await this.calculateCartTotals(cart);
    await cart.save();
    return cart;
  }

  async clearCart() {
    return this.cartModel.findOneAndDelete({});
  }

  async getCartItemByProductId(productId: string) {
    return this.cartModel.findOne(
      { 'items.productId': new Types.ObjectId(productId) },
      { 'items.$': 1 },
    );
  }
}
