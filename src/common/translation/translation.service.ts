import { Injectable } from '@nestjs/common';
import translate from 'translate-google';

@Injectable()
export class TranslationService {
  async toArabic(text: string): Promise<string> {
    if (!text) return text;

    try {
      const result = await translate(text, { to: 'ar' });
      return result;
    } catch (err) {
      console.log('Translation failed, using English fallback');
      return text;
    }
  }
}