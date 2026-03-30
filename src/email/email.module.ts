import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [ProductsModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
