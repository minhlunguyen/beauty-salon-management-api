import { Injectable } from '@nestjs/common';
import { ManipulatorService } from '@src/account/services/manipulator.services';
import { AppException } from '@src/common/exceptions/app.exception';
import { Types } from 'mongoose';
import { Errors } from '../contracts/error';
import { MenuStatus, MenuType } from '../contracts/type';
import { MenuInfo, MenuTicket } from '../contracts/value-object';
import { CreateMenuDto } from '../dtos/create-menu.dto';
import { UpdateMenuDto } from '../dtos/update-menu.dto';
import { ChangeStatusMenuDto } from '../dtos/change-status-menu.dto';
import { MenuRepository } from '../repositories/menu.repository';
import { PaginateDto } from '@src/common/dtos/paginate.dto';
import { FilterMenuListDto } from '@src/salon/dtos/menu-list.dto';
import { MenuDocument } from '../schemas/menu.schema';
import {
  GetMenuItemByManipulatorResponse,
  GetMenusByManipulatorOutput,
  MenuTicketItemResponse,
} from '@src/reservation/dtos/get-menus-by-manipulator.dto';
import { statuses } from '@src/account/schemas/manipulator.schema';
import { TicketRepository } from '../repositories/ticket.repository';
import { Ticket } from '../schemas/ticket.schema';
import { TicketService } from '@src/coupon/services/ticket.service';
import { IChangeMenuTicketResult } from '@src/coupon/contracts/interfaces';
import { AppLogger } from '@src/common/services/app-logger.service';

@Injectable()
export class MenuService {
  constructor(
    private readonly _menuRepository: MenuRepository,
    private readonly _manipulatorService: ManipulatorService,
    private readonly _ticketRepository: TicketRepository,
    private readonly _ticketService: TicketService,
    private readonly _loggerService: AppLogger,
  ) {}

  async createMenu(userId: string, salonId: string, params: CreateMenuDto) {
    const manipulator = await this._manipulatorService.findById(userId);
    const manipulatorIds = params.manipulatorIds || [];

    // check valid manipulators
    const manipulators = await this._manipulatorService.findByConditions({
      _id: {
        $in: manipulatorIds,
      },
      'salon.salonId': new Types.ObjectId(salonId),
    });
    if (manipulators.length !== manipulatorIds.length) {
      const { code, message, status } = Errors.INVALID_MANIPULATOR;
      throw new AppException(code, message, status);
    }

    // check menu type
    const menuTypes = params.menuTypes;
    if (menuTypes.indexOf(MenuType.OneTime) !== -1 && !params.price) {
      const { code, message, status } = Errors.INVALID_DATA;
      throw new AppException(code, message, status);
    }

    if (
      (menuTypes.indexOf(MenuType.Coupon) !== -1 && !params.ticket) ||
      (params.ticket && menuTypes.indexOf(MenuType.Coupon) === -1)
    ) {
      const { code, message, status } = Errors.INVALID_CREATE_MENU_WITH_TICKET;
      throw new AppException(code, message, status);
    }

    const data = {
      salonId: new Types.ObjectId(salonId),
      name: params.name,
      manipulatorIds:
        manipulatorIds.length > 0
          ? params.manipulatorIds.map((id) => new Types.ObjectId(id))
          : [],
      createdById: manipulator._id,
      currency: params.currency,
      order: params.order,
      estimatedTime: params.estimatedTime,
      timeDisplay: params.timeDisplay || false,
      price: undefined,
      ticket: undefined,
      menuTypes: params.menuTypes,
      status: params.status,
    };

    if (menuTypes.indexOf(MenuType.OneTime) !== -1) {
      data.price = params.price;
    }

    const apiReturned: {
      ticketId?: number;
    } = {};

    try {
      const session = await this._menuRepository.startSession();
      await session.withTransaction(async (session) => {
        const menuEntity = await this._menuRepository.create(data, { session });
        const menu: MenuInfo = {
          menuId: new Types.ObjectId(menuEntity._id),
          name: menuEntity.name,
          estimatedTime: menuEntity.estimatedTime,
          order: menuEntity.order,
          price: menuEntity.price,
          currency: menuEntity.currency,
          status: menuEntity.status,
          timeDisplay: menuEntity.timeDisplay,
        };

        await this._manipulatorService.updateMany(
          { _id: { $in: menuEntity.manipulatorIds } },
          { $push: { menus: menu } },
          { session },
        );

        if (params.ticket) {
          const expiryMonth = params.ticket?.expiryMonth || 1;
          const ticketResponse = await this._ticketService.createTicket({
            ticketName: menu.name,
            menuId: menuEntity.id,
            availableDays: expiryMonth * 30,
            servicerId: manipulator.id,
            numberOfTicket: params.ticket.numberOfTicket,
          });
          apiReturned.ticketId = ticketResponse.id;
          await this._ticketService.assignTicketTags(ticketResponse.id);

          // insert record to ticket collection
          const ticketData: Ticket = {
            menuId: new Types.ObjectId(menuEntity._id),
            couponId: ticketResponse.id,
            code: ticketResponse.code,
            price: params.ticket.price,
            numberOfTicket: params.ticket.numberOfTicket,
            expiryMonth: expiryMonth,
          };

          const ticketEntity = await this._ticketRepository.create(ticketData, {
            session,
          });

          // update ticket to menu
          const ticket = new MenuTicket();
          ticket.id = ticketEntity._id;
          ticket.couponId = ticketResponse.id;
          ticket.code = ticketResponse.code;
          ticket.numberOfTicket = params.ticket.numberOfTicket;
          ticket.price = params.ticket.price;
          ticket.expiryMonth = expiryMonth;

          await this._menuRepository.findOneAndUpdate(
            {
              _id: new Types.ObjectId(menuEntity._id),
            },
            {
              ticket: ticket,
            },
            { session },
          );
        }
      });
      session.endSession();
    } catch (e) {
      if (apiReturned.ticketId) {
        await this._ticketService.inActiveTicket(apiReturned.ticketId);
        await this._ticketService.deleteTicket(apiReturned.ticketId);
      }
      const { code, message, status } = Errors.CAN_NOT_CREATE_MENU;
      throw new AppException(code, message, status);
    }
    return true;
  }

  /**
   *
   * @param paginationParam
   * @returns
   */
  async getMenuList(
    _id: string,
    salonId: string,
    filterMenu: FilterMenuListDto,
    paginationParam: PaginateDto,
  ) {
    return this._menuRepository.pagination({
      conditions: {
        salonId: new Types.ObjectId(salonId),
        isDeleted: false,
        $or: [
          { createdById: new Types.ObjectId(_id) },
          {
            manipulatorIds: {
              $elemMatch: { $eq: new Types.ObjectId(_id) },
            },
          },
        ],
        ...filterMenu,
      },
      ...paginationParam,
      select: [
        '_id',
        'name',
        'salonId',
        'manipulatorIds',
        'createdById',
        'order',
        'estimatedTime',
        'timeDisplay',
        'price',
        'currency',
        'ticket',
        'menuTypes',
        'status',
      ],
    });
  }

  /**
   * update Menu by menu id
   * @param menuId
   * @param salonId
   * @param params: UpdateMenuDto
   * @returns
   */
  async updateMenu(menuId: string, salonId: string, params: UpdateMenuDto) {
    const manipulatorIds = params.manipulatorIds || [];

    // vaidate menu
    const menuData = await this._menuRepository.findOne({
      conditions: { _id: new Types.ObjectId(menuId), isDeleted: false },
    });
    if (!menuData) {
      const { code, message, status } = Errors.INVALID_MENU;
      throw new AppException(code, message, status);
    }

    // check valid manipulators
    const manipulators = await this._manipulatorService.findByConditions({
      _id: {
        $in: manipulatorIds,
      },
      'salon.salonId': new Types.ObjectId(salonId),
    });

    if (manipulators.length !== manipulatorIds.length) {
      const { code, message, status } = Errors.INVALID_MANIPULATOR;
      throw new AppException(code, message, status);
    }

    // check menu type
    const menuTypes = params.menuTypes;
    if (menuTypes.indexOf(MenuType.OneTime) !== -1 && !params.price) {
      const { code, message, status } = Errors.INVALID_DATA;
      throw new AppException(code, message, status);
    }

    if (menuTypes.indexOf(MenuType.Coupon) !== -1 && !params.ticket) {
      const { code, message, status } = Errors.INVALID_CREATE_MENU_WITH_TICKET;
      throw new AppException(code, message, status);
    }

    const data = {
      salonId: new Types.ObjectId(salonId),
      name: params.name,
      manipulatorIds:
        manipulatorIds.length > 0
          ? params.manipulatorIds.map((id) => new Types.ObjectId(id))
          : [],
      currency: params.currency,
      order: params.order,
      estimatedTime: params.estimatedTime,
      timeDisplay: params?.timeDisplay ?? menuData.timeDisplay,
      price: menuData.price,
      ticket: menuData.ticket,
      menuTypes: params.menuTypes,
      status: params.status,
    };

    if (menuTypes.indexOf(MenuType.OneTime) !== -1) {
      data.price = params.price;
    }

    let hasUpdateTicket = false;
    if (menuTypes.indexOf(MenuType.Coupon) !== -1 && params.ticket) {
      hasUpdateTicket = true;
    }

    let ticketData = {} as IChangeMenuTicketResult;
    const menuTicketData = menuData.ticket ?? new MenuTicket();
    if (params?.ticket?.price) {
      menuTicketData.price = params.ticket.price;
    }
    if (params?.ticket?.numberOfTicket) {
      menuTicketData.numberOfTicket = params.ticket.numberOfTicket;
    }
    if (params?.ticket?.expiryMonth) {
      menuTicketData.expiryMonth = params.ticket.expiryMonth;
    }

    try {
      const session = await this._menuRepository.startSession();
      await session.withTransaction(async (session) => {
        if (hasUpdateTicket) {
          ticketData = await this._ticketService.processChangeMenuTicket({
            menu: menuData,
            ticketParams: menuTicketData,
            ticketName: params.name,
          });
        }

        if (ticketData.isCreate) {
          const ticketInput: Ticket = {
            menuId: new Types.ObjectId(menuData._id),
            couponId: ticketData.couponId,
            code: ticketData.code,
            price: menuTicketData.price,
            numberOfTicket: menuTicketData.numberOfTicket,
            expiryMonth: menuTicketData.expiryMonth,
          };

          const ticketEntity = await this._ticketRepository.create(
            ticketInput,
            {
              session,
            },
          );

          // set data ticket to menu
          const ticket = new MenuTicket();
          ticket.id = ticketEntity._id;
          ticket.couponId = ticketData.couponId;
          ticket.code = ticketData.code;
          ticket.numberOfTicket = menuTicketData.numberOfTicket;
          ticket.price = menuTicketData.price;
          ticket.expiryMonth = menuTicketData.expiryMonth;
          data.ticket = ticket;
        } else if (ticketData.isUpdate) {
          data.ticket = {
            ...menuData.ticket,
            price: menuTicketData.price,
            numberOfTicket: menuTicketData.numberOfTicket,
            expiryMonth: menuTicketData.expiryMonth,
          };
        }

        const menuEntity = await this._menuRepository.findOneAndUpdate(
          { _id: menuData._id },
          data,
          {
            session,
            new: true,
          },
        );
        const menu: MenuInfo = {
          menuId: menuEntity._id,
          name: menuEntity.name,
          estimatedTime: menuEntity.estimatedTime,
          order: menuEntity.order,
          price: menuEntity.price,
          currency: menuEntity.currency,
          status: menuEntity.status,
          timeDisplay: menuEntity.timeDisplay,
        };

        // remove old data
        await this._manipulatorService.updateMany(
          {},
          { $pull: { menus: { menuId: menuData._id } } },
          { session },
        );

        // update menu to new manipulator
        if (manipulatorIds.length > 0) {
          await this._manipulatorService.updateMany(
            {
              _id: {
                $in: manipulatorIds.map((item) => new Types.ObjectId(item)),
              },
            },
            { $push: { menus: menu } },
            { session },
          );
        }
      });

      session.endSession();
    } catch (error) {
      const { message: errorMsg, stack } = error;
      this._loggerService.error(
        errorMsg,
        stack,
        JSON.stringify({
          ...params,
          menuId,
          salonId,
        }),
      );

      if (ticketData.isCreate) {
        await this._ticketService.inActiveTicket(ticketData.couponId);
        await this._ticketService.deleteTicket(ticketData.couponId);
      } else if (ticketData.isUpdate) {
        await this._ticketService.updateTicket(
          ticketData.couponId,
          ticketData.oldCouponData,
        );
      }
      const { code, message, status } = Errors.CAN_NOT_UPDATE_MENU;
      throw new AppException(code, message, status);
    }

    return true;
  }
  /**
   * @param _id
   * @param status
   * @returns
   */
  async changeStatus(
    menuId: string,
    salonId: string,
    manipulatorId: string,
    statusData: Partial<ChangeStatusMenuDto>,
  ) {
    try {
      const session = await this._menuRepository.startSession();
      await session.withTransaction(async (session) => {
        const conditions = {
          _id: new Types.ObjectId(menuId),
          salonId: new Types.ObjectId(salonId),
          createdById: new Types.ObjectId(manipulatorId),
          isDeleted: false,
        };
        const entity = await this._menuRepository.findOneAndUpdate(
          conditions,
          statusData,
          { session: session, new: true },
        );
        // update menu to new manipulator
        if (entity.manipulatorIds.length > 0) {
          await this._manipulatorService.updateMany(
            {
              _id: { $in: entity.manipulatorIds },
              'menus.menuId': new Types.ObjectId(menuId),
            },
            {
              $set: {
                'menus.$.status': entity.status,
              },
            },
            { session },
          );
        }
      });
      session.endSession();
    } catch (e) {
      const { code, message, status } = Errors.CAN_NOT_UPDATE_MENU;
      throw new AppException(code, message, status);
    }
    return true;
  }

  /**
   * Finding the menu by Id
   *
   * @param {string} menuId
   * @param {string} salonId
   * @param {string} manipulatorId
   * @returns Promise<MenuDocument>
   */
  async getMenuInfo(
    menuId: string,
    salonId: string,
    manipulatorId: string,
  ): Promise<MenuDocument> {
    return this._menuRepository.firstOrFail({
      conditions: {
        _id: new Types.ObjectId(menuId),
        salonId: new Types.ObjectId(salonId),
        isDeleted: false,
        $or: [
          { createdById: new Types.ObjectId(manipulatorId) },
          {
            manipulatorIds: {
              $elemMatch: { $eq: new Types.ObjectId(manipulatorId) },
            },
          },
        ],
      },
      selectedFields: [
        '_id',
        'name',
        'salonId',
        'manipulatorIds',
        'createdById',
        'order',
        'estimatedTime',
        'timeDisplay',
        'price',
        'currency',
        'ticket',
        'menuTypes',
        'status',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  /**
   *
   * @param manipulatorId string
   * @returns GetMenusByManipulatorOutput
   */
  async getMenusByManipulatorId(
    manipulatorId: string,
  ): Promise<GetMenusByManipulatorOutput> {
    const manipulator = await this._manipulatorService.findById(manipulatorId);
    if (manipulator.status !== statuses.ACTIVE) {
      const { code, message, status } = Errors.INVALID_MANIPULATOR;
      throw new AppException(code, message, status);
    }
    const menuIds = manipulator.menus || [];
    const conditions = {
      _id: { $in: menuIds.map((item) => item.menuId) },
      status: MenuStatus.Public,
      isDeleted: false,
    };
    const menus = await this._menuRepository.find({
      conditions,
      sort: { order: 1 },
    });
    const results = new GetMenusByManipulatorOutput();
    const data = menus.map((menu) => {
      const item = new GetMenuItemByManipulatorResponse();
      const menuTypes = menu.menuTypes;
      const ticket: MenuTicketItemResponse = {
        id: menu.ticket?.id?.toString(),
        price: menu.ticket?.price,
        expiryMonth: menu.ticket?.expiryMonth,
        numberOfTicket: menu.ticket?.numberOfTicket,
      };
      item._id = menu.id;
      item.name = menu.name;
      item.salonId = menu.salonId.toString();
      item.createdById = menu.createdById.toString();
      item.price = menu.price;
      item.ticket = menuTypes.indexOf(MenuType.Coupon) !== -1 ? ticket : null;
      item.menuTypes = menu.menuTypes;
      item.estimatedTime = menu.estimatedTime;
      item.timeDisplay = menu.timeDisplay;
      item.currency = menu.currency;
      return item;
    });
    results.docs = data;
    return results;
  }

  /**
   * @param <String> menuId
   * @param <String> salonId
   * @param <String> manipulatorId
   * @returns
   */
  async deleteMenu(menuId: string, salonId: string) {
    try {
      const session = await this._menuRepository.startSession();
      const softDelete = { isDeleted: true };
      await session.withTransaction(async (session) => {
        const conditions = {
          _id: new Types.ObjectId(menuId),
          salonId: new Types.ObjectId(salonId),
          isDeleted: false,
        };
        const entity = await this._menuRepository.findOneAndUpdate(
          conditions,
          softDelete,
          { session: session, new: true },
        );
        // update menu to new manipulator
        if (entity.manipulatorIds.length > 0) {
          await this._manipulatorService.updateMany(
            {
              _id: { $in: entity.manipulatorIds },
              'menus.menuId': new Types.ObjectId(menuId),
            },
            { $pull: { menus: { menuId: new Types.ObjectId(menuId) } } },
            { session },
          );
        }
      });
      session.endSession();
    } catch (e) {
      const { code, message, status } = Errors.CAN_NOT_UPDATE_MENU;
      throw new AppException(code, message, status);
    }
    return true;
  }
}
