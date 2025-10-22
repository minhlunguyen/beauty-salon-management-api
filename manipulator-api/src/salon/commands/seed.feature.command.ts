import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { FeatureService } from '@src/salon/services/feature.service';

const masterData = [
  { _id: 1, name: 'Near Station' },
  { _id: 2, name: 'Parking Available' },
  { _id: 3, name: 'COVID-19 Measures' },
  { _id: 4, name: 'Kids Space Available' },
  { _id: 5, name: 'Child-Friendly' },
  { _id: 6, name: 'Wheelchair Accessible' },
  { _id: 7, name: 'Women Only' },
  { _id: 8, name: 'English Speaking Staff' },
];

@Injectable()
export class SeedFeatureCommand {
  constructor(private readonly featureService: FeatureService) {}

  @Command({
    command: 'seed:feature',
    describe: 'Populating the feature master data',
  })
  async create() {
    for (const item of masterData) {
      const { _id, name } = item;
      // creating records without dupplicated
      await this.featureService.findOneAndUpdate(
        { _id },
        { _id, name },
        { upsert: true },
      );
    }
  }
}
