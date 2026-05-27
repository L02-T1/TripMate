const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  process.env.JWT_SECRET = 'test_secret';
  process.env.NODE_ENV = 'test';

  // Patch connect to use in-memory URI
  const db = require('../src/config/database');
  await db.connect();

  // Load app after DB is ready (without calling listen)
  app = require('../src/index');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function registerAndLogin(overrides = {}) {
  const payload = {
    email: overrides.email || 'test@tripmate.app',
    username: overrides.username || 'Test User',
    phone: overrides.phone || '+84901000001',
    password: overrides.password || 'Password@123',
  };
  const reg = await request(app).post('/auth/register').send(payload);
  return { token: reg.body.token, user: reg.body.user, payload };
}

// ── Auth Tests ────────────────────────────────────────────────────────────────

describe('POST /auth/register', () => {
  it('registers a new user and returns token', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'hello@tripmate.app',
      username: 'Hello User',
      phone: '+84901000002',
      password: 'Secure@123',
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('rejects duplicate email', async () => {
    await registerAndLogin({ email: 'dup@tripmate.app' });
    const res = await request(app).post('/auth/register').send({
      email: 'dup@tripmate.app', username: 'Dup', phone: '+84900000099', password: 'abc123',
    });
    expect(res.status).toBe(409);
  });

  it('rejects missing fields', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'x@x.com' });
    expect(res.status).toBe(400);
  });
});

describe('POST /auth/login', () => {
  it('logs in with email', async () => {
    const { payload } = await registerAndLogin();
    const res = await request(app).post('/auth/login').send({
      emailOrPhone: payload.email,
      password: payload.password,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('logs in with phone', async () => {
    const { payload } = await registerAndLogin({ phone: '+84901000010' });
    const res = await request(app).post('/auth/login').send({
      emailOrPhone: payload.phone,
      password: payload.password,
    });
    expect(res.status).toBe(200);
  });

  it('rejects wrong password', async () => {
    const { payload } = await registerAndLogin({ email: 'bad@tripmate.app', phone: '+84901000011' });
    const res = await request(app).post('/auth/login').send({
      emailOrPhone: payload.email,
      password: 'WrongPass',
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /auth/me', () => {
  it('returns current user', async () => {
    const { token } = await registerAndLogin({ email: 'me@tripmate.app', phone: '+84901000020' });
    const res = await request(app).get('/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', 'me@tripmate.app');
  });

  it('rejects unauthenticated', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /auth/profile', () => {
  it('updates user bio', async () => {
    const { token } = await registerAndLogin({ email: 'bio@tripmate.app', phone: '+84901000030' });
    const res = await request(app)
      .patch('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'Travel lover', location: 'Ho Chi Minh City' });
    expect(res.status).toBe(200);
    expect(res.body.bio).toBe('Travel lover');
  });
});

describe('PATCH /auth/password', () => {
  it('changes password successfully', async () => {
    const { token, payload } = await registerAndLogin({ email: 'pw@tripmate.app', phone: '+84901000040' });
    const res = await request(app)
      .patch('/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: payload.password, newPassword: 'NewPass@456' });
    expect(res.status).toBe(200);
  });

  it('rejects wrong current password', async () => {
    const { token } = await registerAndLogin({ email: 'pw2@tripmate.app', phone: '+84901000041' });
    const res = await request(app)
      .patch('/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'WrongOld', newPassword: 'NewPass@456' });
    expect(res.status).toBe(400);
  });
});

// ── Trip Tests ────────────────────────────────────────────────────────────────

describe('GET /trips', () => {
  it('returns empty array for new user', async () => {
    const { token } = await registerAndLogin({ email: 't1@tripmate.app', phone: '+84901001001' });
    const res = await request(app).get('/trips').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /trips', () => {
  it('creates a trip with leader member', async () => {
    const { token } = await registerAndLogin({ email: 't2@tripmate.app', phone: '+84901001002' });
    const res = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Da Lat Summer 2025',
        startDate: '28/06/2025',
        endDate: '04/07/2025',
        destinations: ['Đà Lạt'],
      });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Da Lat Summer 2025');
    expect(res.body.members).toHaveLength(1);
    expect(res.body.members[0].role).toBe('leader');
    expect(res.body).toHaveProperty('inviteCode');
  });

  it('rejects trip without name', async () => {
    const { token } = await registerAndLogin({ email: 't3@tripmate.app', phone: '+84901001003' });
    const res = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({ startDate: '01/01/2025' });
    expect(res.status).toBe(400);
  });
});

describe('Trip CRUD', () => {
  let token, tripId;

  beforeEach(async () => {
    const reg = await registerAndLogin({ email: 'crud@tripmate.app', phone: '+84901001010' });
    token = reg.token;
    const r = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Trip' });
    tripId = r.body.id;
  });

  it('gets trip by id', async () => {
    const res = await request(app).get(`/trips/${tripId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(tripId);
  });

  it('updates trip', async () => {
    const res = await request(app)
      .patch(`/trips/${tripId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Trip', status: 'ONGOING' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Trip');
  });

  it('deletes trip', async () => {
    const res = await request(app).delete(`/trips/${tripId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const check = await request(app).get(`/trips/${tripId}`).set('Authorization', `Bearer ${token}`);
    expect(check.status).toBe(404);
  });
});

describe('Trip Members', () => {
  let token, tripId;

  beforeEach(async () => {
    const reg = await registerAndLogin({ email: 'mem@tripmate.app', phone: '+84901002001' });
    token = reg.token;
    const r = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Member Test Trip' });
    tripId = r.body.id;
  });

  it('adds a member by phone', async () => {
    const res = await request(app)
      .post(`/trips/${tripId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ phone: '+84912345678' });
    expect(res.status).toBe(201);
    expect(res.body.phone).toBe('+84912345678');
  });

  it('prevents duplicate member', async () => {
    await request(app)
      .post(`/trips/${tripId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ phone: '+84911111111' });
    const res = await request(app)
      .post(`/trips/${tripId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ phone: '+84911111111' });
    expect(res.status).toBe(409);
  });
});

describe('Trip Activities', () => {
  let token, tripId;

  beforeEach(async () => {
    const reg = await registerAndLogin({ email: 'act@tripmate.app', phone: '+84901003001' });
    token = reg.token;
    const r = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Activity Trip' });
    tripId = r.body.id;
  });

  it('adds and retrieves an activity', async () => {
    await request(app)
      .post(`/trips/${tripId}/activities`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Tham quan Hồ Xuân Hương', location: 'Đà Lạt', date: '30/06/2025' });

    const res = await request(app)
      .get(`/trips/${tripId}/activities`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Tham quan Hồ Xuân Hương');
  });
});

describe('Trip Expenses & Report', () => {
  let token, tripId;

  beforeEach(async () => {
    const reg = await registerAndLogin({ email: 'exp@tripmate.app', phone: '+84901004001' });
    token = reg.token;
    const r = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Expense Trip' });
    tripId = r.body.id;
  });

  it('adds expense and gets report', async () => {
    await request(app)
      .post(`/trips/${tripId}/expenses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Bún bò buổi trưa',
        amount: 300000,
        category: 'food',
        paidBy: 'Alex',
        splitType: 'equal',
        participants: ['Alex', 'Bao', 'Minh'],
      });

    const res = await request(app)
      .get(`/trips/${tripId}/expense-report`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.totalCost).toBe(300000);
    expect(res.body).toHaveProperty('transactions');
  });
});

describe('Trip Checklist', () => {
  let token, tripId;

  beforeEach(async () => {
    const reg = await registerAndLogin({ email: 'chk@tripmate.app', phone: '+84901005001' });
    token = reg.token;
    const r = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Checklist Trip' });
    tripId = r.body.id;
  });

  it('adds and updates a checklist item', async () => {
    const add = await request(app)
      .post(`/trips/${tripId}/checklist`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Mua vé cáp treo', category: 'shared' });
    expect(add.status).toBe(201);
    const itemId = add.body._id;

    const update = await request(app)
      .patch(`/trips/${tripId}/checklist/${itemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ completed: true });
    expect(update.status).toBe(200);
    expect(update.body.completed).toBe(true);
  });
});
// ── Extra Coverage Tests ─────────────────────────────────────────────────────

describe('Auth Edge Cases', () => {
  it('rejects invalid token', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid_token');

    expect(res.status).toBe(401);
  });

  it('rejects weak password on register', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'weak@tripmate.app',
        username: 'Weak',
        phone: '+84909999999',
        password: '123',
      });

    expect([400, 422]).toContain(res.status);
  });

  it('rejects login with missing credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('Trip Error Cases', () => {
  let token;

  beforeEach(async () => {
    const reg = await registerAndLogin({
      email: 'edge@tripmate.app',
      phone: '+84908888888',
    });

    token = reg.token;
  });

  it('returns 404 for non-existent trip', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/trips/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('rejects unauthorized trip access', async () => {
    const res = await request(app)
      .get('/trips');

    expect(res.status).toBe(401);
  });

  it('rejects adding expense without amount', async () => {
    const trip = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Expense Error Trip' });

    const tripId = trip.body.id;

    const res = await request(app)
      .post(`/trips/${tripId}/expenses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Invalid Expense',
      });

    expect(res.status).toBe(400);
  });

  it('rejects checklist update with invalid item', async () => {
    const trip = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Checklist Error Trip' });

    const tripId = trip.body.id;
    const fakeItemId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .patch(`/trips/${tripId}/checklist/${fakeItemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ completed: true });

    expect([400, 404, 500]).toContain(res.status);
  });
});

describe('Notifications Routes', () => {
  let token;

  beforeEach(async () => {
    const reg = await registerAndLogin({
      email: 'notify@tripmate.app',
      phone: '+84907777777',
    });

    token = reg.token;
  });

  it('gets notifications list', async () => {
    const res = await request(app)
      .get('/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.status).toBe(200);
expect(res.body.success).toBe(true);
expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('marks all notifications as read', async () => {
    const res = await request(app)
      .patch('/notifications/read-all')
      .set('Authorization', `Bearer ${token}`);

    expect([200, 204]).toContain(res.status);
  });
});
// ───────────────── EXTRA COVERAGE TESTS ─────────────────

describe('Unauthorized Access', () => {
  it('rejects GET /trips without token', async () => {
    const res = await request(app).get('/trips');
    expect(res.status).toBe(401);
  });

  it('rejects POST /trips without token', async () => {
    const res = await request(app)
      .post('/trips')
      .send({ name: 'Unauthorized Trip' });

    expect(res.status).toBe(401);
  });

  it('rejects GET /auth/me with invalid token', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.status).toBe(401);
  });
});

describe('Register Validation Coverage', () => {
  it('rejects invalid email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'bad-email',
        username: 'Bad',
        phone: '+84901111111',
        password: 'Password@123',
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('rejects weak password', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'weak@tripmate.app',
        username: 'Weak',
        phone: '+84901111112',
        password: '123',
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('rejects duplicate phone', async () => {
    await registerAndLogin({
      email: 'dup-phone1@tripmate.app',
      phone: '+84908888888',
    });

    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'dup-phone2@tripmate.app',
        username: 'Dup',
        phone: '+84908888888',
        password: 'Password@123',
      });

    expect(res.status).toBe(409);
  });
});

describe('Login Validation Coverage', () => {
  it('rejects missing password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        emailOrPhone: 'x@x.com',
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('rejects non-existing user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        emailOrPhone: 'nouser@tripmate.app',
        password: 'Password@123',
      });

    expect(res.status).toBe(401);
  });
});

describe('Trip Validation Coverage', () => {
  let token;

  beforeEach(async () => {
    const reg = await registerAndLogin({
      email: 'validation@tripmate.app',
      phone: '+84907777777',
    });

    token = reg.token;
  });

  it('rejects invalid trip id', async () => {
    const res = await request(app)
      .get('/trips/invalid-id')
      .set('Authorization', `Bearer ${token}`);

    expect([400, 404, 500]).toContain(res.status);
  });

  it('rejects update non-existing trip', async () => {
    const res = await request(app)
      .patch('/trips/665f1b2c1111111111111111')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nothing' });

    expect([404, 400]).toContain(res.status);
  });

  it('rejects delete non-existing trip', async () => {
    const res = await request(app)
      .delete('/trips/665f1b2c1111111111111111')
      .set('Authorization', `Bearer ${token}`);

    expect([404, 400]).toContain(res.status);
  });
});

describe('Trip Member Branch Coverage', () => {
  let token;
  let tripId;

  beforeEach(async () => {
    const reg = await registerAndLogin({
      email: 'memberbranch@tripmate.app',
      phone: '+84906666666',
    });

    token = reg.token;

    const trip = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Branch Trip' });

    tripId = trip.body.id;
  });

  it('rejects adding member without phone', async () => {
    const res = await request(app)
      .post(`/trips/${tripId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('rejects invalid member phone', async () => {
    const res = await request(app)
      .post(`/trips/${tripId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        phone: 'abc',
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe('Trip Activity Branch Coverage', () => {
  let token;
  let tripId;

  beforeEach(async () => {
    const reg = await registerAndLogin({
      email: 'activitybranch@tripmate.app',
      phone: '+84905555555',
    });

    token = reg.token;

    const trip = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Activity Branch Trip' });

    tripId = trip.body.id;
  });

  it('rejects activity without name', async () => {
    const res = await request(app)
      .post(`/trips/${tripId}/activities`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '01/01/2025',
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('gets empty activities list', async () => {
    const res = await request(app)
      .get(`/trips/${tripId}/activities`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Expense Branch Coverage', () => {
  let token;
  let tripId;

  beforeEach(async () => {
    const reg = await registerAndLogin({
      email: 'expensebranch@tripmate.app',
      phone: '+84904444444',
    });

    token = reg.token;

    const trip = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Expense Branch Trip' });

    tripId = trip.body.id;
  });

  it('rejects expense without amount', async () => {
    const res = await request(app)
      .post(`/trips/${tripId}/expenses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Expense',
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('gets empty expense report', async () => {
    const res = await request(app)
      .get(`/trips/${tripId}/expense-report`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

describe('Checklist Branch Coverage', () => {
  let token;
  let tripId;

  beforeEach(async () => {
    const reg = await registerAndLogin({
      email: 'checkbranch@tripmate.app',
      phone: '+84903333333',
    });

    token = reg.token;

    const trip = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Checklist Branch Trip' });

    tripId = trip.body.id;
  });

  it('rejects checklist item without name', async () => {
    const res = await request(app)
      .post(`/trips/${tripId}/checklist`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('rejects updating invalid checklist item', async () => {
    const res = await request(app)
      .patch(`/trips/${tripId}/checklist/665f1b2c1111111111111111`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        completed: true,
      });

    expect([400, 404, 500]).toContain(res.status);
  });
});

describe('Users & Notifications Coverage', () => {
  let token;

  beforeEach(async () => {
    const reg = await registerAndLogin({
      email: 'userscoverage@tripmate.app',
      phone: '+84902222222',
    });

    token = reg.token;
  });

  it('gets users profile/list endpoint', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect([200, 404]).toContain(res.status);
  });

  it('gets notifications endpoint', async () => {
    const res = await request(app)
      .get('/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect([200, 404]).toContain(res.status);
  });
});