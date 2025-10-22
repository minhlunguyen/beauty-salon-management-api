import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csv from 'fast-csv';
import * as stream from 'stream';
import { BankBranchRepository } from '../repositories/bank-branch.repository';
import { BankBranchDocument } from '../schemas/bank-branch.schema';

@Injectable()
export class SeedBankBranchCommand {
  constructor(private bankBranchRepository: BankBranchRepository) {}

  @Command({
    command: 'seed:bank-branch',
    describe: 'Populating the bank branches master data',
  })
  async create() {
    const stream = fs
      .createReadStream(`${process.cwd()}/src/data/import/BankBranch.csv`)
      .pipe(csv.parse({ headers: true }));
    const data = await this.readableToData(stream);
    await this.bankBranchRepository.insertMany(data);
  }

  /**
   * Reads all the text in a readable stream and returns it to data,
   * via a Promise.
   * @param {stream.Readable} readable
   */
  async readableToData(
    readable: stream.Readable,
  ): Promise<BankBranchDocument[]> {
    return new Promise((resolve, reject) => {
      const masterData: BankBranchDocument[] = [];
      readable.on('data', function (row) {
        const {
          _id,
          branchCode,
          _p_bank,
          branchNameCode,
          branchName,
          telephone,
          address,
          postalCode,
          branchNameHiragana,
          noMean,
          noMean2,
          noMean3,
        } = row;
        masterData.push({
          _id,
          branchCode,
          bankRef: _p_bank.replace('Bank$', ''),
          branchNameCode,
          branchName,
          telephone,
          address,
          postalCode,
          branchNameHiragana,
          noMean,
          noMean2,
          noMean3,
        } as BankBranchDocument);
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
