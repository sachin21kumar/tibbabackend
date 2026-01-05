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

  // ------------------ Existing Methods ------------------

  // ✅ Create a new location (NOW SUPPORTS IMAGE)
  create(dto: CreateLocationDto & { imagePath?: any }) {
    return this.locationModel.create({
      name: dto.name,
      description: dto.description,
      area: dto.area,
      location: dto.location, // single string now
      operation_hours: dto.operation_hours,
      branchEmail: dto.branchEmail,
      telephone: dto.telephone,
      mobileNumber: dto.mobileNumber,
       lat: parseFloat(dto.lat as any),
    lng: parseFloat(dto.lng as any),
      imagePath: dto.imagePath || null,
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

  // Update a location by ID (NO IMAGE CHANGE HERE – SAFE)
  async update(id: string, dto: UpdateLocationDto) {
    const updated = await this.locationModel.findByIdAndUpdate(
      id,
      { ...dto },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Location not found');
    return updated;
  }

  // Remove a location by ID
  async remove(id: string) {
    const deleted = await this.locationModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Location not found');
    return deleted;
  }

  // ------------------ Selected Location ------------------

  // In-memory storage for selected location ID
  private selectedLocationId: string | null = null;

  // Set selected location
  async setSelectedLocation(locationId: string) {
    const loc = await this.locationModel.findById(locationId);
    if (!loc) throw new NotFoundException('Location not found');
    this.selectedLocationId = locationId;
    return { message: 'Location selected', locationId };
  }

  // Get selected location
  getSelectedLocation() {
    return { locationId: this.selectedLocationId };
  }

  // Update selected location
  async updateSelectedLocation(locationId: string) {
    const loc = await this.locationModel.findById(locationId);
    if (!loc) throw new NotFoundException('Location not found');
    this.selectedLocationId = locationId;
    return { message: 'Selected location updated', locationId };
  }
}
