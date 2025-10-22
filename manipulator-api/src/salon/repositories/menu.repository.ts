import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Menu, MenuDocument } from '../schemas/menu.schema';

@Injectable()
export class MenuRepository extends AbstractRepository<MenuDocument> {
  constructor(@InjectModel(Menu.name) model: PaginateModel<MenuDocument>) {
    super(model);
  }

  /**
   * Get menus hashed by ids
   *
   * @param {string[]} menuIds
   * @param {string[]} selectedFields
   * @returns {Promise<Map<string, MenuDocument>>}
   */
  async getMenusHashByIds(
    menuIds: string[],
    selectedFields = ['_id', 'name'],
  ): Promise<Map<string, MenuDocument>> {
    const menus = await this.find({
      conditions: { _id: { $in: menuIds.map((id) => new Types.ObjectId(id)) } },
      selectedFields: selectedFields,
    });

    const result = new Map<string, MenuDocument>();
    for (const menu of menus) {
      result.set(menu._id.toHexString(), menu);
    }

    return result;
  }

  /**
   * Get menus hashed by ids
   *
   * @param {string[]} menuIds
   * @returns {Promise<Map<string, TResult>>}
   */
  async getMenusWithManipulator<
    TResult extends { id: string; name: string; manipulatorId: string },
  >(menuIds: string[]): Promise<Map<string, TResult>> {
    const menus = await this.find({
      conditions: { _id: { $in: menuIds.map((id) => new Types.ObjectId(id)) } },
      selectedFields: ['_id', 'name', 'manipulatorIds'],
    });

    const result = new Map<string, TResult>();
    for (const menu of menus) {
      result.set(menu._id.toHexString(), {
        id: menu._id.toHexString(),
        name: menu.name,
        manipulatorId: menu.manipulatorIds[0]?.toHexString(),
      } as TResult);
    }

    return result;
  }
}
