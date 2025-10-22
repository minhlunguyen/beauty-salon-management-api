import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csv from 'fast-csv';
import * as stream from 'stream';
import { BankRepository } from '../repositories/bank.repository';
import { BankDocument } from '../schemas/bank.schema';

@Injectable()
export class SeedBankCommand {
  constructor(private bankRepository: BankRepository) {}

  @Command({
    command: 'seed:bank',
    describe: 'Populating the bank master data',
  })
  async create() {
    const stream = fs
      .createReadStream(`${process.cwd()}/src/data/import/Bank.csv`)
      .pipe(csv.parse({ headers: true }));
    const data = await this.readableToData(stream);
    await this.bankRepository.insertMany(data);
  }

  /**
   * Reads all the text in a readable stream and returns it to data,
   * via a Promise.
   * @param {stream.Readable} readable
   */
  async readableToData(readable: stream.Readable): Promise<BankDocument[]> {
    return new Promise((resolve, reject) => {
      const masterData: BankDocument[] = [];
      readable.on('data', function (row) {
        const {
          _id,
          bankNameCode,
          bankName,
          bankCode,
          bankNameHiragana,
          addedFirstSearchChar,
        } = row;
        masterData.push({
          _id,
          bankName,
          bankNameCode,
          bankCode,
          bankNameHiragana,
          addedFirstSearchChar: addedFirstSearchChar === 'TRUE',
        } as BankDocument);
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
