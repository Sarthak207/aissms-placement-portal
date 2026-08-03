const request = require('supertest');
const app = require('../../src/app');
const { Student, Branch, Department } = require('../../src/models');

async function seedBranch() {
  const dept = await Department.create({ name: 'Engineering', code: 'ENG' });
  return Branch.create({ name: 'Computer Science', code: 'CSE', departmentId: dept._id });
}

async function registerStudent(overrides = {}) {
  const branch = await seedBranch();
  const payload = {
    name: 'Asha Verma',
    email: 'asha@example.com',
    password: 'Password123',
    role: 'student',
    rollNumber: 'CSE001',
    branchId: branch._id.toString(),
    passingYear: 2026,
    ...overrides,
  };
  return request(app).post('/api/v1/auth/register').send(payload);
}

describe('POST /api/v1/auth/register', () => {
  it('creates a new student user, auto-verified and their Student profile', async () => {
    const res = await registerStudent();
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('asha@example.com');
    expect(res.body.data.isEmailVerified).toBe(true); // accounts are usable immediately, no email step
    expect(res.body.data.passwordHash).toBeUndefined(); // must never leak the hash

    const student = await Student.findOne({ rollNumber: 'CSE001' });
    expect(student).not.toBeNull();
  });

  it('rejects a duplicate email with 409', async () => {
    await registerStudent();
    const res = await registerStudent();
    expect(res.status).toBe(409);
  });

  it('rejects a weak password with a 422 validation error', async () => {
    const res = await registerStudent({ email: 'weak@example.com', password: 'weak' });
    expect(res.status).toBe(422);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('logs in immediately after registration — no verification step required', async () => {
    await registerStudent();

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'asha@example.com', password: 'Password123' });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=/);
  });

  it('rejects an incorrect password', async () => {
    await registerStudent();

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'asha@example.com', password: 'WrongPassword1' });
    expect(res.status).toBe(401);
  });

  it('locks the account after 5 consecutive failed attempts', async () => {
    await registerStudent();

    for (let i = 0; i < 5; i += 1) {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'asha@example.com', password: 'WrongPassword1' });
    }

    // 6th attempt, even with the CORRECT password, should now be locked out
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'asha@example.com', password: 'Password123' });
    expect(res.status).toBe(429);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('rejects requests with no access token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns the current user when a valid access token is supplied', async () => {
    await registerStudent();
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'asha@example.com', password: 'Password123' });

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.data.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('asha@example.com');
  });
});

describe('POST /api/v1/auth/refresh', () => {
  it('rotates the refresh token and issues a new access token', async () => {
    await registerStudent();
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'asha@example.com', password: 'Password123' });

    const cookie = loginRes.headers['set-cookie'];
    const refreshRes = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.data.accessToken).toBeDefined();
    expect(refreshRes.body.data.accessToken).not.toBe(loginRes.body.data.accessToken);
  });

  it('rejects reuse of an already-rotated refresh token', async () => {
    await registerStudent();
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'asha@example.com', password: 'Password123' });

    const cookie = loginRes.headers['set-cookie'];
    await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie); // first use rotates it

    const secondUse = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie);
    expect(secondUse.status).toBe(401);
  });
});
