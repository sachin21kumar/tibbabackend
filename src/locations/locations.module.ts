import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { Location, LocationSchema } from './locations.schems';
import { TranslationModule } from 'src/common/translation/translation.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
    ]),
    TranslationModule
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports:[LocationsService]
})
export class LocationsModule {}
