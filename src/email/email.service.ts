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

    if (!process.env.EMAIL_FROM) {
      throw new InternalServerErrorException('EMAIL_FROM not set');
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    const msg = {
      to,
      from: process.env.EMAIL_FROM as string,
      subject,
      html,
    };

    console.log('Email payload:', {
      to: msg.to,
      from: msg.from,
      subject: msg.subject,
    });

    try {
      const response = await sgMail.send(msg);
      console.log('SendGrid response:', response[0]?.statusCode);
      return response;
    } catch (error: any) {
      console.error('Error sending email FULL:', error);
      console.error('Error response body:', error?.response?.body);
      console.error('Error status code:', error?.code);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendOrderConfirmation(to: string, order: any) {
    console.log('Sending order confirmation to:', to);
    console.log('Order ID:', order?._id);
    console.log(order, 'order details');

    await this.sendEmail({
      to,
      subject: `Order Confirmation - ${order._id}`,
      html: `
        <div style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:40px 15px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:580px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

                  <!-- HEADER -->
                  <tr>
                    <td align="center" style="background:linear-gradient(135deg,#111827 0%,#1f2937 100%);padding:40px 24px 36px 24px;">
                      <img
                        src="https://tibba.ae/tibba-logo.png"
                        alt="Tibba Logo"
                        width="150"
                        style="display:block;width:150px;max-width:150px;height:auto;margin:0 auto 20px;border:0;"
                      />
                      <div style="display:inline-block;background:#f59e0b;color:#111827;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:6px 18px;border-radius:999px;margin-bottom:16px;">
                        ✓ &nbsp;Order Confirmed
                      </div>
                      <h1 style="margin:0;color:#ffffff;font-size:26px;line-height:1.3;font-weight:700;">
                        Thank you for your order!
                      </h1>
                      <p style="margin:10px 0 0 0;color:#9ca3af;font-size:14px;line-height:1.6;">
                        We've received your order and it's now being processed.
                      </p>
                    </td>
                  </tr>

                  <!-- GREETING -->
                  <tr>
                    <td style="padding:36px 40px 20px 40px;">
                      <p style="margin:0;font-size:16px;line-height:1.7;color:#374151;">
                        Hello <strong style="color:#111827;">${order.fullName || order.name || 'Customer'}</strong>,
                      </p>
                    </td>
                  </tr>

                  <!-- ORDER SUMMARY CARD -->
                  <tr>
                    <td style="padding:0 40px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">
                        <tr>
                          <td style="padding:14px 20px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#9ca3af;width:40%;background:#f9fafb;">
                            Order ID
                          </td>
                          <td style="padding:14px 20px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;font-weight:700;font-family:monospace;background:#f9fafb;">
                            #${order._id}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:14px 20px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#9ca3af;">
                            Date
                          </td>
                          <td style="padding:14px 20px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;font-weight:600;">
                            ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:16px 20px;background:#111827;font-size:14px;color:#ffffff;font-weight:700;">
                            Total Amount
                          </td>
                          <td style="padding:16px 20px;background:#111827;font-size:20px;color:#f59e0b;font-weight:800;">
                            $${Number(order.total || 0).toFixed(2)}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- MESSAGE -->
                  <tr>
                    <td style="padding:24px 40px 0 40px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fff7ed;border:1px solid #fcd34d;border-radius:14px;">
                        <tr>
                          <td style="padding:22px 24px;">
                            <p style="margin:0;font-size:14px;line-height:1.9;color:#92400e;">
                              Our team is preparing your order. You'll receive another email once your order status changes. If you have any questions, feel free to reach out to us.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- CLOSING -->
                  <tr>
                    <td style="padding:28px 40px 36px 40px;">
                      <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.8;">
                        Warm regards,<br/>
                        <strong style="color:#111827;">The Tibba Team</strong>
                      </p>
                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="padding:20px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
                      <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">
                        This is an automated order confirmation email. Please do not reply.
                      </p>
                      <p style="margin:0;font-size:12px;color:#d1d5db;">
                        © Tibba. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </div>
      `,
    });
  }

  async sendOrderStatusUpdate(
    to: string,
    data: {
      orderId: string;
      orderStatus: string;
      driverName?: string;
      driverPhone?: string;
      customerName?: string;
    },
  ) {
    console.log('Sending order status update to:', to);
    console.log('Order ID:', data.orderId);
    console.log('Order Status:', data.orderStatus);

    await this.sendEmail({
      to,
      subject: `Order Update - ${data.orderId}`,
      html: `
    <div style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f4f7;padding:30px 15px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;">
              <tr>
                <td align="center" style="background:#111827;padding:28px 20px;">
                  <img
                    src="https://tibba.ae/tibba-logo.png"
                    width="180"
                    style="max-width:180px;height:auto;display:block;margin:0 auto 12px;"
                  />
                  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">
                    Order Update
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding:32px 28px 20px 28px;color:#111827;">
                  <p style="margin:0 0 14px;font-size:16px;">
                    Hello ${data.customerName || 'Customer'},
                  </p>

                  <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
                    Your order has been updated. Here are the latest details for your order.
                  </p>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
                    <tr>
                      <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;width:40%;">
                        Order ID
                      </td>
                      <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827;font-weight:600;">
                        ${data.orderId}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;">
                        Status
                      </td>
                      <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;">
                        <span style="display:inline-block;background:#ecfdf5;color:#065f46;font-size:13px;font-weight:700;padding:6px 12px;border-radius:999px;">
                          ${data.orderStatus || 'New'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;">
                        Driver Name
                      </td>
                      <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827;font-weight:600;">
                        ${data.driverName || 'Not assigned yet'}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:14px 16px;font-size:14px;color:#6b7280;">
                        Driver Phone
                      </td>
                      <td style="padding:14px 16px;font-size:14px;color:#111827;font-weight:600;">
                        ${data.driverPhone || 'Not available yet'}
                      </td>
                    </tr>
                  </table>

                  <p style="margin:24px 0 0;font-size:14px;color:#4b5563;line-height:1.7;">
                    Thank you for ordering with us. We'll keep you informed about any further updates.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:20px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
                  <p style="margin:0;font-size:12px;color:#6b7280;">
                    Please do not reply to this email. This is an automated message.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `,
    });
  }
}
