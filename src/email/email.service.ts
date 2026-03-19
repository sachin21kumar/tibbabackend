import { Injectable, InternalServerErrorException } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor() {
    console.log(
      'SENDGRID_API_KEY:',
      process.env.SENDGRID_API_KEY?.slice(0, 10),
    );
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

    if (!process.env.SENDGRID_API_KEY) {
      throw new InternalServerErrorException('SENDGRID_API_KEY not set');
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendOrderConfirmation(to: string, order: any) {
    console.log('Sending email to:', to);
    console.log('Order ID:', order?._id);

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

    console.log('Email payload:', {
      to: msg.to,
      from: msg.from,
      subject: msg.subject,
    });

    try {
      const response = await sgMail.send(msg);
      console.log('SendGrid response:', response[0]?.statusCode);
      console.log('SendGrid headers:', response[0]?.headers);
    } catch (error) {
      console.error('Error sending email FULL:', error);
      console.error('Error response body:', error?.response?.body);
      console.error('Error status code:', error?.code);
    }
  }
}
