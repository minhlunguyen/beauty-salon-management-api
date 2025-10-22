import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csv from 'fast-csv';
import * as stream from 'stream';
import { StationDocument } from '../schemas/station.schema';
import { StationRepository } from '../repositories/station.repository';

@Injectable()
export class SeedStationCommand {
  constructor(private stationRepository: StationRepository) {}

  @Command({
    command: 'seed:station',
    describe: 'Populating the station master data',
  })
  async create() {
    const stream = fs
      .createReadStream(`${process.cwd()}/src/data/import/Station.csv`)
      .pipe(csv.parse({ headers: true }));
    const data = await this.readableToData(stream);
    await this.stationRepository.insertMany(data);
  }

  /**
   * Reads all the text in a readable stream and returns it to data,
   * via a Promise.
   * @param {stream.Readable} readable
   */
  async readableToData(readable: stream.Readable): Promise<StationDocument[]> {
    return new Promise((resolve, reject) => {
      const masterData: StationDocument[] = [];
      readable.on('data', function (row) {
        const { station_cd, line_cd, station_name, station_g_cd } = row;
        masterData.push({
          _id: station_cd,
          lineId: line_cd,
          groupId: station_g_cd,
          name: station_name,
        } as StationDocument);
      });
      readable.on('end', function () {
        resolve(masterData);
      });
      readable.on('error', function (err) {
        reject(err);
      });
    });
  }
}
