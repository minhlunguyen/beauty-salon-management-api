import { handlePagination } from '@src/common/decorators/pagination';
import { createRequest } from 'node-mocks-http';

describe('decorators.pagination.handlePagination', () => {
  it('request param is empty', async () => {
    const request = createRequest({
      query: {},
    });

    const result = handlePagination(request);
    expect(result).toMatchObject({
      page: 1,
      limit: 10,
      sort: {
        createdAt: -1,
        _id: 1,
      },
    });
  });

  it('request param is full', async () => {
    const request = createRequest({
      query: {
        page: 2,
        limit: 20,
        sort: 'name.asc_age.desc',
      },
    });

    const result = handlePagination(request);
    expect(result).toMatchObject({
      page: 2,
      limit: 20,
      sort: {
        name: 1,
        age: -1,
        _id: 1,
      },
    });
  });

  it('page and limit is not number', async () => {
    const request = createRequest({
      query: {
        page: 'hi',
        limit: 'ha',
        sort: 'name.asc_age.desc',
      },
    });

    const result = handlePagination(request);
    expect(result).toMatchObject({
      page: 1,
      limit: 10,
      sort: {
        name: 1,
        age: -1,
        _id: 1,
      },
    });
  });

  it('page and limit is string number', async () => {
    const request = createRequest({
      query: {
        page: '2',
        limit: '20',
        sort: 'name.asc_age.desc',
      },
    });

    const result = handlePagination(request);
    expect(result).toMatchObject({
      page: 2,
      limit: 20,
      sort: {
        name: 1,
        age: -1,
        _id: 1,
      },
    });
  });

  it('page and limit is less than zero', async () => {
    const request = createRequest({
      query: {
        page: -1,
        limit: -1,
        sort: 'name.asc_age.desc',
      },
    });

    const result = handlePagination(request);
    expect(result).toMatchObject({
      page: 1,
      limit: 10,
      sort: {
        name: 1,
        age: -1,
        _id: 1,
      },
    });
  });

  it('sort miss sort type', async () => {
    const request = createRequest({
      query: {
        sort: 'name_age',
      },
    });

    const result = handlePagination(request);
    expect(result).toMatchObject({
      page: 1,
      limit: 10,
      sort: {
        name: -1,
        age: -1,
        _id: 1,
      },
    });
  });
});
