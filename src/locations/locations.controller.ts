import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

const productImageStorage = diskStorage({
  destination: './uploads/products',
  filename: (_req, file, callback) => {
    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1e9);
    callback(null, uniqueName + extname(file.originalname));
  },
});

class SelectLocationDto {
  @IsString()
  @IsNotEmpty()
  locationId: string;
}


@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}


  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: productImageStorage,
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          cb(new Error('Only image files are allowed'), false);
          return;
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  create(
    @Body() dto: CreateLocationDto,
    @UploadedFile() image?: any,
  ) {
    return this.locationsService.create({
      ...dto,
      imagePath: image?.filename || null,
    });
  }

  @Get()
  findAll() {
    return this.locationsService.findAll().lean();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
    return this.locationsService.update(id, dto);
  }

  @Patch(':id/image')
@UseInterceptors(
  FileInterceptor('image', {
    storage: productImageStorage,
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        cb(new Error('Only image files are allowed'), false);
        return;
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }),
)
async updateImage(@Param('id') id: string, @UploadedFile() image?: any) {
  if (!image) {
    throw new Error('No image file uploaded');
  }
  return this.locationsService.updateImage(id, image.filename);
}


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationsService.remove(id);
  }

  @Post('select')
  selectLocation(@Body() dto: SelectLocationDto) {
    return this.locationsService.setSelectedLocation(dto.locationId);
  }

  @Get('selected')
  getSelectedLocation() {
    return this.locationsService.getSelectedLocation();
  }

  @Patch('selected')
  updateSelectedLocation(@Body() dto: SelectLocationDto) {
    return this.locationsService.updateSelectedLocation(dto.locationId);
  }
}
