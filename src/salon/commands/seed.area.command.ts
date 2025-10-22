import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { AreaService } from '../services/area.service';

const masterData = [
  { _id: 1, name: 'Manhattan', provinceId: 1, provinceName: 'New York' },
  { _id: 2, name: 'Brooklyn', provinceId: 1, provinceName: 'New York' },
  { _id: 3, name: 'Queens', provinceId: 1, provinceName: 'New York' },
  { _id: 4, name: 'Bronx', provinceId: 1, provinceName: 'New York' },
  { _id: 5, name: 'Staten Island', provinceId: 1, provinceName: 'New York' },
  { _id: 6, name: 'Downtown', provinceId: 2, provinceName: 'Los Angeles' },
  { _id: 7, name: 'Hollywood', provinceId: 2, provinceName: 'Los Angeles' },
  { _id: 8, name: 'Beverly Hills', provinceId: 2, provinceName: 'Los Angeles' },
  { _id: 9, name: 'Santa Monica', provinceId: 2, provinceName: 'Los Angeles' },
  { _id: 10, name: 'West Hollywood', provinceId: 2, provinceName: 'Los Angeles' },
  { _id: 11, name: 'Venice', provinceId: 2, provinceName: 'Los Angeles' },
  { _id: 12, name: 'Pasadena', provinceId: 2, provinceName: 'Los Angeles' },
  { _id: 13, name: 'Downtown', provinceId: 3, provinceName: 'Chicago' },
  { _id: 14, name: 'Lincoln Park', provinceId: 3, provinceName: 'Chicago' },
  { _id: 15, name: 'Gold Coast', provinceId: 3, provinceName: 'Chicago' },
  { _id: 16, name: 'Wicker Park', provinceId: 3, provinceName: 'Chicago' },
  { _id: 17, name: 'Lakeview', provinceId: 3, provinceName: 'Chicago' },
  { _id: 18, name: 'Bucktown', provinceId: 3, provinceName: 'Chicago' },
  { _id: 19, name: 'Downtown', provinceId: 4, provinceName: 'Houston' },
  { _id: 20, name: 'Midtown', provinceId: 4, provinceName: 'Houston' },
  { _id: 21, name: 'Heights', provinceId: 4, provinceName: 'Houston' },
  { _id: 22, name: 'Montrose', provinceId: 4, provinceName: 'Houston' },
  { _id: 23, name: 'Galleria', provinceId: 4, provinceName: 'Houston' },
  { _id: 24, name: 'Rice Village', provinceId: 4, provinceName: 'Houston' },
  { _id: 25, name: 'Downtown', provinceId: 5, provinceName: 'Phoenix' },
  { _id: 26, name: 'Scottsdale', provinceId: 5, provinceName: 'Phoenix' },
  { _id: 27, name: 'Tempe', provinceId: 5, provinceName: 'Phoenix' },
  { _id: 28, name: 'Mesa', provinceId: 5, provinceName: 'Phoenix' },
  { _id: 29, name: 'Glendale', provinceId: 5, provinceName: 'Phoenix' },
  { _id: 30, name: 'Chandler', provinceId: 5, provinceName: 'Phoenix' },
  { _id: 31, name: 'Gilbert', provinceId: 5, provinceName: 'Phoenix' },
  { _id: 32, name: 'Peoria', provinceId: 5, provinceName: 'Phoenix' },
  { _id: 33, name: 'Surprise', provinceId: 5, provinceName: 'Phoenix' },
];

@Injectable()
export class SeedAreaCommand {
  constructor(private readonly areaService: AreaService) {}

  @Command({
    command: 'seed:area',
    describe: 'Populating the area master data',
  })
  async create() {
    for (const item of masterData) {
      const { _id, name, provinceId, provinceName } = item;
      // creating records without dupplicated
      await this.areaService.findOneAndUpdate(
        { _id },
        { _id, provinceId, name, provinceName },
        { upsert: true },
      );
    }
  }
}
