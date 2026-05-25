/* ============================================================
   data/testTemplates.js  (Part 3)
   Test stubs keyed by issueId.
   Used by TestGenerator.js to pre-populate generated tests
   before the AI enriches them.
   ============================================================ */

window.TEST_TEMPLATES = {
  'bug-001': {
    issueId    : 'bug-001',
    framework  : 'jest',
    file       : '__tests__/userController.test.js',
    description: 'getUser — null pointer safety',
    code: `import { getUser } from '../src/api/userController';
import { getUserById } from '../src/db/users';

jest.mock('../src/db/users');

describe('getUser()', () => {
  it('returns 404 when user is not found', async () => {
    getUserById.mockResolvedValue(null);
    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('returns settings when user and profile exist', async () => {
    getUserById.mockResolvedValue({
      profile: { settings: { theme: 'dark', notifications: true } },
    });
    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getUser(req, res);

    expect(res.json).toHaveBeenCalledWith({
      settings: { theme: 'dark', notifications: true },
    });
  });

  it('returns empty settings when profile is null', async () => {
    getUserById.mockResolvedValue({ profile: null });
    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getUser(req, res);

    expect(res.json).toHaveBeenCalledWith({ settings: {} });
  });
});`,
  },

  'security-001': {
    issueId    : 'security-001',
    framework  : 'jest',
    file       : '__tests__/queryBuilder.test.js',
    description: 'findUserByName — SQL injection prevention',
    code: `import { findUserByName } from '../src/utils/queryBuilder';
import db from '../src/db';

jest.mock('../src/db');

describe('findUserByName()', () => {
  it('queries with a parameterised where clause', async () => {
    const mockWhere = jest.fn().mockResolvedValue([]);
    db.mockReturnValue({ select: () => ({ from: () => ({ where: mockWhere }) }) });

    await findUserByName({ query: { name: 'alice' } });

    expect(mockWhere).toHaveBeenCalledWith({ name: 'alice' });
  });

  it('does NOT construct raw SQL strings', async () => {
    const rawSpy = jest.spyOn(db, 'raw');
    await findUserByName({ query: { name: 'test' } });
    expect(rawSpy).not.toHaveBeenCalled();
  });

  it('resists SQL injection payloads', async () => {
    const payload = "' OR '1'='1";
    const mockWhere = jest.fn().mockResolvedValue([]);
    db.mockReturnValue({ select: () => ({ from: () => ({ where: mockWhere }) }) });

    const result = await findUserByName({ query: { name: payload } });

    // Parameterised query returns empty — no data leak
    expect(result).toHaveLength(0);
  });
});`,
  },

  'bug-002': {
    issueId    : 'bug-002',
    framework  : 'jest',
    file       : '__tests__/listController.test.js',
    description: 'pagination offset — off-by-one regression',
    code: `import { calcOffset } from '../src/api/listController';

describe('calcOffset()', () => {
  it('page 1 produces offset 0', () => {
    expect(calcOffset(1, 20)).toBe(0);
  });

  it('page 2 produces offset 20', () => {
    expect(calcOffset(2, 20)).toBe(20);
  });

  it('page 3 produces offset 40', () => {
    expect(calcOffset(3, 20)).toBe(40);
  });

  it('custom limit of 50 — page 2 gives offset 50', () => {
    expect(calcOffset(2, 50)).toBe(50);
  });

  it('defaults to page 1 for invalid input', () => {
    expect(calcOffset(0, 20)).toBe(0);
    expect(calcOffset(-1, 20)).toBe(0);
  });
});`,
  },

  'performance-001': {
    issueId    : 'performance-001',
    framework  : 'jest',
    file       : '__tests__/orderService.test.js',
    description: 'listOrders — N+1 query prevention',
    code: `import { listOrders } from '../src/services/orderService';
import { Order, Item } from '../src/models';

jest.mock('../src/models');

describe('listOrders()', () => {
  it('fetches orders with items in a single eager-load query', async () => {
    Order.findAll.mockResolvedValue([]);

    await listOrders();

    expect(Order.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.arrayContaining([
          expect.objectContaining({ model: Item }),
        ]),
      })
    );
  });

  it('does NOT call Item.findAll inside a loop', async () => {
    Order.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    await listOrders();

    // Item.findAll should never be called separately
    expect(Item.findAll).not.toHaveBeenCalled();
  });
});`,
  },
};
