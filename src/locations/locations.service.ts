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

  // Create a new location
  create(dto: CreateLocationDto) {
    return this.locationModel.create({
      name: dto.name,
      description: dto.description,
      area: dto.area,
      location: dto.location, // single string now
      operation_hours: dto.operation_hours,
      branchEmail: dto.branchEmail,
      telephone: dto.telephone,
      mobileNumber: dto.mobileNumber,
    });
  }

  // Get all locations sorted by creation date (descending)
  findAll() {
    return this.locationModel.find().sort({ createdAt: -1 });
  }

  // Get one location by ID
  async findOne(id: string) {
    const location = await this.locationModel.findById(id);
    if (!location) throw new NotFoundException('Location not found');
    return location;
  }

  // Update a location by ID
  async update(id: string, dto: UpdateLocationDto) {
    const updated = await this.locationModel.findByIdAndUpdate(id, { ...dto }, { new: true });
    if (!updated) throw new NotFoundException('Location not found');
    return updated;
  }

  // Remove a location by ID
  async remove(id: string) {
    const deleted = await this.locationModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Location not found');
    return deleted;
  }
}
