import { Module } from '@nestjs/common';
import { TranslationService } from './translation.service';

@Module({
  providers: [TranslationService],
  exports: [TranslationService], // ⭐ VERY IMPORTANT
})
export class TranslationModule {}