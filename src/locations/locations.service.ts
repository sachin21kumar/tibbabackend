import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationDocument, Location } from './locations.schems';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(Location.name)
    private locationModel: Model<LocationDocument>,
  ) {}

  create(dto: CreateLocationDto & { imagePath?: any }) {
    return this.locationModel.create({
      name: dto.name,
      description: dto.description,
      area: dto.area,
      location: dto.location,
      operation_hours: dto.operation_hours,
      branchEmail: dto.branchEmail,
      telephone: dto.telephone,
      mobileNumber: dto.mobileNumber,
      lat: parseFloat(dto.lat as any),
      lng: parseFloat(dto.lng as any),
      imagePath: dto.imagePath || null,
    });
  }

  findAll() {
    return this.locationModel.find().sort({ createdAt: -1 }).lean();
  }

  async findOne(id: string) {
    const location = await this.locationModel.findById(id).lean();
    if (!location) throw new NotFoundException('Location not found');
    return location;
  }

  async update(id: string, dto: UpdateLocationDto) {
    const updated = await this.locationModel
      .findByIdAndUpdate(id, { ...dto }, { new: true })
      .lean();
    if (!updated) throw new NotFoundException('Location not found');
    return updated;
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
