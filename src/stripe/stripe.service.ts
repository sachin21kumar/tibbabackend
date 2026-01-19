import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new InternalServerErrorException(
        'STRIPE_SECRET_KEY is not defined',
      );
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    });
  }

  async createPaymentIntent(amount: number,orderId: string) {
    const amountInCents = Math.round(amount * 100);

    const data=await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'aed',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: { orderId }
    });
    return data
  }
}
