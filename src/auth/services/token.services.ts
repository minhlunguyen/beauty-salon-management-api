import { Injectable } from '@nestjs/common';
import { TokenRepository } from '@src/auth/repositories/token.repository';
import * as moment from 'moment-timezone';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(
    public tokenRepository: TokenRepository,
    private jwtService: JwtService,
  ) {}

  public async createOrUpdateToken({ role, userId, deviceId }) {
    const expiredAt = moment().add(60, 'days').toDate();
    let entiry = await this.tokenRepository.findOne({
      conditions: {
        userId,
        role,
        deviceId,
      },
    });
    if (entiry) {
      entiry.expiredAt = expiredAt;
      await entiry.save();
      return entiry;
    } else {
      entiry = await this.tokenRepository.create({
        role,
        userId,
        expiredAt,
        token: await this.jwtService.sign({ userId, role, deviceId }),
        deviceId,
      });
    }

    return entiry;
  }

  public async getDataOfToken({ refreshToken }) {
    const entiry = await this.tokenRepository.firstOrFail({
      conditions: {
        token: refreshToken,
        expiredAt: { $gte: moment().toDate() },
      },
    });

    return {
      userId: entiry.userId,
      role: entiry.role,
      deviceId: entiry.deviceId,
    };
  }

  public async removeTokens({ refreshToken }) {
    const data = this.jwtService.decode(refreshToken);
    if (data['userId']) {
      await this.tokenRepository.model.remove({
        token: { $ne: refreshToken },
        userId: data['userId'],
      });
    }
    await this.tokenRepository.model.findOneAndUpdate(
      { token: refreshToken },
      { expiredAt: moment().toDate() },
    );
  }

  /**
   *
   * @param {string} role
   * @param {string} userId
   * @returns String
   */
  public async getLastTimeLogin(role: string, userId: string): Promise<string> {
    const entity = await this.tokenRepository.findOne({
      conditions: {
        role: role,
        userId: userId,
      },
      options: { sort: { createdAt: -1 } },
    });
    if (entity) {
      return (entity as any).createdAt;
    }
    return null;
  }
}
