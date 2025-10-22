import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { LineService } from '@src/salon/services/line.service';

const masterData = [
  { _id: 11301, name: 'Main Line (Tokyo - Atami)' },
  { _id: 11302, name: 'Yamanote Line' },
  { _id: 11303, name: 'Nambu Line' },
  { _id: 11305, name: 'Musashino Line' },
  { _id: 11306, name: 'Yokohama Line' },
  { _id: 11308, name: 'Yokosuka Line' },
  { _id: 11311, name: 'Chuo Main Line (Tokyo - Shiojiri)' },
  { _id: 11312, name: 'Chuo Line (Rapid)' },
  { _id: 11313, name: 'Chuo-Sobu Line' },
  { _id: 11314, name: 'Sobu Main Line' },
  { _id: 11315, name: 'Ome Line' },
  { _id: 11316, name: 'Itsukaichi Line' },
  { _id: 11317, name: 'Hachiko Line (Hachioji - Komagawa)' },
  { _id: 11319, name: 'Utsunomiya Line' },
  { _id: 11320, name: 'Joban Line (Ueno - Toride)' },
  { _id: 11321, name: 'Saikyo Line' },
  { _id: 11323, name: 'Takasaki Line' },
  { _id: 11326, name: 'Keiyo Line' },
  { _id: 11328, name: 'Narita Express' },
  { _id: 11332, name: 'Keihin-Tohoku Line' },
  { _id: 11333, name: 'Shonan-Shinjuku Line' },
  { _id: 11343, name: 'Ueno-Tokyo Line' },
  { _id: 21001, name: 'Tobu Tojo Line' },
  { _id: 21002, name: 'Tobu Isesaki Line' },
  { _id: 21005, name: 'Tobu Kameido Line' },
  { _id: 21006, name: 'Tobu Daishi Line' },
  { _id: 22001, name: 'Seibu Ikebukuro Line' },
  { _id: 22003, name: 'Seibu Yurakucho Line' },
  { _id: 22004, name: 'Seibu Toshima Line' },
  { _id: 22006, name: 'Leo Liner' },
  { _id: 22007, name: 'Seibu Shinjuku Line' },
  { _id: 22008, name: 'Seibu Haijima Line' },
  { _id: 22009, name: 'Seibu Seibu-en Line' },
  { _id: 22010, name: 'Seibu Kokubunji Line' },
  { _id: 22011, name: 'Seibu Tamako Line' },
  { _id: 22012, name: 'Seibu Tamagawa Line' },
  { _id: 23001, name: 'Keisei Main Line' },
  { _id: 23002, name: 'Keisei Oshiage Line' },
  { _id: 23003, name: 'Keisei Kanamachi Line' },
  { _id: 23006, name: 'Narita Sky Access' },
  { _id: 24001, name: 'Keio Line' },
  { _id: 24002, name: 'Keio Sagamihara Line' },
  { _id: 24003, name: 'Keio Takao Line' },
  { _id: 24004, name: 'Keio Racecourse Line' },
  { _id: 24005, name: 'Keio Animal Park Line' },
  { _id: 24006, name: 'Keio Inokashira Line' },
  { _id: 24007, name: 'Keio New Line' },
  { _id: 25001, name: 'Odakyu Line' },
  { _id: 25003, name: 'Odakyu Tama Line' },
  { _id: 26001, name: 'Tokyu Toyoko Line' },
  { _id: 26002, name: 'Tokyu Meguro Line' },
  { _id: 26003, name: 'Tokyu Den-en-toshi Line' },
  { _id: 26004, name: 'Tokyu Oimachi Line' },
  { _id: 26005, name: 'Tokyu Ikegami Line' },
  { _id: 26006, name: 'Tokyu Tamagawa Line' },
  { _id: 26007, name: 'Tokyu Setagaya Line' },
  { _id: 27001, name: 'Keikyu Main Line' },
  { _id: 27002, name: 'Keikyu Airport Line' },
  { _id: 28001, name: 'Tokyo Metro Ginza Line' },
  { _id: 28002, name: 'Tokyo Metro Marunouchi Line' },
  { _id: 28003, name: 'Tokyo Metro Hibiya Line' },
  { _id: 28004, name: 'Tokyo Metro Tozai Line' },
  { _id: 28005, name: 'Tokyo Metro Chiyoda Line' },
  { _id: 28006, name: 'Tokyo Metro Yurakucho Line' },
  { _id: 28008, name: 'Tokyo Metro Hanzomon Line' },
  { _id: 28009, name: 'Tokyo Metro Namboku Line' },
  { _id: 28010, name: 'Tokyo Metro Fukutoshin Line' },
  { _id: 29003, name: 'Sotetsu-JR Direct Line' },
  { _id: 99301, name: 'Toei Oedo Line' },
  { _id: 99302, name: 'Toei Asakusa Line' },
  { _id: 99303, name: 'Toei Mita Line' },
  { _id: 99304, name: 'Toei Shinjuku Line' },
  { _id: 99305, name: 'Tokyo Sakura Tram (Toden Arakawa Line)' },
  { _id: 99307, name: 'Saitama Rapid Railway Line' },
  { _id: 99309, name: 'Tsukuba Express' },
  { _id: 99311, name: 'Yurikamome Line' },
  { _id: 99334, name: 'Tama Monorail' },
  { _id: 99336, name: 'Tokyo Monorail' },
  { _id: 99337, name: 'Rinkai Line' },
  { _id: 99340, name: 'Hokuso Railway Hokuso Line' },
  { _id: 99342, name: 'Nippori-Toneri Liner' },
];

@Injectable()
export class SeedLineCommand {
  constructor(private readonly lineService: LineService) {}

  @Command({
    command: 'seed:line',
    describe: 'Populating the line master data',
  })
  async create() {
    for (const item of masterData) {
      const { _id, name } = item;
      // creating records without dupplicated
      await this.lineService.findOneAndUpdate(
        { _id },
        { _id, name },
        { upsert: true },
      );
    }
  }
}
