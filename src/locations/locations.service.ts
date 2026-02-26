import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationDocument, Location } from './locations.schems';
import slugify from 'slugify';
import { TranslationService } from '../common/translation/translation.service';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(Location.name)
    private locationModel: Model<LocationDocument>,
    private readonly translationService: TranslationService,
  ) {}

  private async ensureArabicTranslation(loc: any) {
    if (!loc?.translations?.en) return loc;

    if (
      loc.translations?.ar?.name &&
      loc.translations.ar.name !== loc.translations.en.name
    ) {
      return loc;
    }

    const en = loc.translations.en;

    const arName = await this.translationService.toArabic(en.name || '');
    const arDesc = await this.translationService.toArabic(en.description || '');
    const arArea = await this.translationService.toArabic(en.area || '');
    const arLocation = await this.translationService.toArabic(
      en.location || '',
    );

    await this.locationModel.updateOne(
      { _id: loc._id },
      {
        $set: {
          'translations.ar.name': arName,
          'translations.ar.description': arDesc,
          'translations.ar.area': arArea,
          'translations.ar.location': arLocation,
        },
      },
    );

    loc.translations.ar = {
      name: arName,
      description: arDesc,
      area: arArea,
      location: arLocation,
    };

    return loc;
  }

  async create(dto: CreateLocationDto & { imagePath?: any }) {
    const baseSlug = slugify(dto.area || dto.name, {
      lower: true,
      strict: true,
      trim: true,
    });

    let slug = baseSlug;
    let counter = 1;

    while (await this.locationModel.exists({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const enName = dto.name.trim();
    const enDesc = dto.description?.trim() || '';
    const enArea = dto.area.trim();
    const enLocation = dto.location.trim();

    const arName = await this.translationService.toArabic(enName);
    const arDesc = await this.translationService.toArabic(enDesc);
    const arArea = await this.translationService.toArabic(enArea);
    const arLocation = await this.translationService.toArabic(enLocation);

    return this.locationModel.create({
      translations: {
        en: {
          name: enName,
          description: enDesc,
          area: enArea,
          location: enLocation,
        },
        ar: {
          name: arName,
          description: arDesc,
          area: arArea,
          location: arLocation,
        },
      },
      operation_hours: dto.operation_hours,
      branchEmail: dto.branchEmail,
      telephone: dto.telephone,
      mobileNumber: dto.mobileNumber,
      lat: parseFloat(dto.lat as any),
      lng: parseFloat(dto.lng as any),
      imagePath: dto.imagePath || null,
      slug,
    });
  }

  async findAll(locale: string = 'en') {
    const customOrder = [
      'Al Qusais',
      'Business Bay',
      'Al Aweer',
      'Deira',
      'Abu Hail',
    ];

    const locations = await this.locationModel.aggregate([
      {
        $addFields: {
          sortOrder: {
            $indexOfArray: [customOrder, `$translations.en.area`],
          },
        },
      },
      {
        $sort: { sortOrder: 1 },
      },
    ]);

    const result: any = [];

    for (let loc of locations as any[]) {
      if (locale === 'ar') {
        loc = await this.ensureArabicTranslation(loc);
      }

      const t = loc.translations?.[locale] || loc.translations?.en;

      result.push({
        ...loc,
        name: t?.name,
        description: t?.description,
        area: t?.area,
        location: t?.location,
      });
    }

    return result;
  }

  async findOne(id: string, locale: string = 'en') {
    let location: any = await this.locationModel.findById(id).lean();
    if (!location) throw new NotFoundException('Location not found');

    if (locale === 'ar') {
      location = await this.ensureArabicTranslation(location);
    }

    const t = location.translations?.[locale] || location.translations?.en;

    return {
      ...location,
      name: t?.name,
      description: t?.description,
      area: t?.area,
      location: t?.location,
    };
  }

  async findBySlug(slug: string, locale: string = 'en') {
    let location: any = await this.locationModel.findOne({ slug }).lean();
    if (!location) throw new NotFoundException('Location not found');

    if (locale === 'ar') {
      location = await this.ensureArabicTranslation(location);
    }

    const t = location.translations?.[locale] || location.translations?.en;

    return {
      ...location,
      name: t?.name,
      description: t?.description,
      area: t?.area,
      location: t?.location,
    };
  }

  async update(id: string, dto: UpdateLocationDto) {
    const location: any = await this.locationModel.findById(id);
    if (!location) throw new NotFoundException('Location not found');

    if (dto.name) {
      location.translations.en.name = dto.name;
      location.translations.ar.name = await this.translationService.toArabic(
        dto.name,
      );
    }

    if (dto.description !== undefined) {
      location.translations.en.description = dto.description || '';
      location.translations.ar.description =
        await this.translationService.toArabic(dto.description || '');
    }

    if (dto.area) {
      location.translations.en.area = dto.area;
      location.translations.ar.area = await this.translationService.toArabic(
        dto.area,
      );
    }

    if (dto.location) {
      location.translations.en.location = dto.location;
      location.translations.ar.location =
        await this.translationService.toArabic(dto.location);
    }

    Object.assign(location, {
      operation_hours: dto.operation_hours,
      branchEmail: dto.branchEmail,
      telephone: dto.telephone,
      mobileNumber: dto.mobileNumber,
      lat: dto.lat ?? location.lat,
      lng: dto.lng ?? location.lng,
    });

    await location.save();
    return location;
  }

  async remove(id: string) {
    const deleted = await this.locationModel.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Location not found');
    return deleted;
  }

  private selectedLocationId: string | null = null;

  async setSelectedLocation(locationId: string) {
    const loc = await this.locationModel.findById(locationId).lean();
    if (!loc) throw new NotFoundException('Location not found');
    this.selectedLocationId = locationId;
    return { message: 'Location selected', locationId };
  }

  getSelectedLocation() {
    return { locationId: this.selectedLocationId };
  }

  async updateSelectedLocation(locationId: string) {
    const loc = await this.locationModel.findById(locationId).lean();
    if (!loc) throw new NotFoundException('Location not found');
    this.selectedLocationId = locationId;
    return { message: 'Selected location updated', locationId };
  }

  async updateImage(id: string, imagePath?: string) {
    const updated = await this.locationModel
      .findByIdAndUpdate(id, { imagePath: imagePath || null }, { new: true })
      .lean();
    if (!updated) throw new NotFoundException('Location not found');
    return updated;
  }
}
