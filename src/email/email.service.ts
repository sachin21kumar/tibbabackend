import { Injectable, InternalServerErrorException } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor() {
    if (!process.env.SENDGRID_API_KEY) {
      throw new InternalServerErrorException('SENDGRID_API_KEY not set');
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendOrderConfirmation(to: string, order: any) {
    const msg: any = { 
      to,
      from: process.env.EMAIL_FROM,
      subject: `Order Confirmation - ${order._id}`,
      html: `
        <h2>Thank you for your order!</h2>
        <p>Your order <strong>${order._id}</strong> has been successfully processed.</p>
        <p>Total: $${order.total}</p>
        <h3>Items:</h3>
        <ul>
          ${order.items
            .map(
              (i) =>
                `<li>${i.name} × ${i.quantity} - $${i.subtotal.toFixed(2)}</li>`,
            )
            .join('')}
        </ul>
        <p>We will notify you when your items are shipped.</p>
      `,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
