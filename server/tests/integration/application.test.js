const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const { User, Student, Branch, Department, Company, PlacementDrive } = require('../../src/models');
const { signAccessToken } = require('../../src/utils/jwt');

/**
 * Tests here bypass the registration/email-verification flow (already covered in
 * auth.test.js) and insert users directly, signing tokens with the same utility the
 * app uses, so we can focus purely on the application/eligibility business logic.
 */
async function createUser(role, overrides = {}) {
  const passwordHash = await bcrypt.hash('Password123', 4);
  const user = await User.create({
    name: overrides.name || `${role} user`,
    email: overrides.email || `${role}@example.com`,
    passwordHash,
    role,
    isEmailVerified: true,
    isActive: true,
  });
  const accessToken = signAccessToken(user);
  return { user, accessToken };
}

async function setupEligibleDrive({ minCgpa = 7 } = {}) {
  const dept = await Department.create({ name: 'Engineering', code: 'ENG' });
  const branch = await Branch.create({ name: 'CSE', code: 'CSE', departmentId: dept._id });
  const company = await Company.create({ name: 'Acme Corp', verificationStatus: 'approved' });
  const { user: tpoUser, accessToken: tpoToken } = await createUser('tpo');

  const driveRes = await request(app)
    .post('/api/v1/drives')
    .set('Authorization', `Bearer ${tpoToken}`)
    .send({
      companyId: company._id.toString(),
      title: 'SDE Drive',
      role: 'Software Engineer',
      type: 'full_time',
      ctc: 10,
      eligibility: { minCgpa, maxLiveBacklogs: 0, maxHistoryBacklogs: 0 },
      applicationDeadline: new Date(Date.now() + 86400000).toISOString(),
    });

  await request(app).patch(`/api/v1/drives/${driveRes.body.data._id}/open`).set('Authorization', `Bearer ${tpoToken}`);

  return { branch, company, drive: driveRes.body.data, tpoToken };
}

async function createVerifiedStudent(branchId, overrides = {}) {
  const { user, accessToken } = await createUser('student', overrides);
  const student = await Student.create({
    userId: user._id,
    rollNumber: overrides.rollNumber || 'CSE100',
    branchId,
    passingYear: 2026,
    cgpa: overrides.cgpa ?? 8,
    liveBacklogs: 0,
    historyBacklogs: 0,
    verificationStatus: 'verified',
  });
  return { user, accessToken, student };
}

describe('POST /api/v1/applications', () => {
  it('allows an eligible, verified student to apply to an open drive', async () => {
    const { branch, drive } = await setupEligibleDrive();
    const { accessToken } = await createVerifiedStudent(branch._id);

    const res = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ driveId: drive._id });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('applied');
  });

  it('rejects a student below the minimum CGPA with 403', async () => {
    const { branch, drive } = await setupEligibleDrive({ minCgpa: 8.5 });
    const { accessToken } = await createVerifiedStudent(branch._id, { cgpa: 7 });

    const res = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ driveId: drive._id });

    expect(res.status).toBe(403);
  });

  it('rejects a duplicate application with 409', async () => {
    const { branch, drive } = await setupEligibleDrive();
    const { accessToken } = await createVerifiedStudent(branch._id);

    await request(app).post('/api/v1/applications').set('Authorization', `Bearer ${accessToken}`).send({ driveId: drive._id });
    const res = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ driveId: drive._id });

    expect(res.status).toBe(409);
  });

  it('rejects an unverified student profile with 403', async () => {
    const { branch, drive } = await setupEligibleDrive();
    const { user, accessToken } = await createUser('student', { email: 'unverified@example.com' });
    await Student.create({
      userId: user._id,
      rollNumber: 'CSE200',
      branchId: branch._id,
      passingYear: 2026,
      cgpa: 9,
      verificationStatus: 'pending',
    });

    const res = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ driveId: drive._id });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/v1/applications/:id (withdraw)', () => {
  it('allows withdrawing an application still in "applied" status', async () => {
    const { branch, drive } = await setupEligibleDrive();
    const { accessToken } = await createVerifiedStudent(branch._id);

    const applyRes = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ driveId: drive._id });

    const withdrawRes = await request(app)
      .delete(`/api/v1/applications/${applyRes.body.data._id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(withdrawRes.status).toBe(200);
    expect(withdrawRes.body.data.status).toBe('withdrawn');
  });
});

describe('PATCH /api/v1/applications/:id/status', () => {
  it('allows the TPO to shortlist an applied student', async () => {
    const { branch, drive, tpoToken } = await setupEligibleDrive();
    const { accessToken } = await createVerifiedStudent(branch._id);

    const applyRes = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ driveId: drive._id });

    const res = await request(app)
      .patch(`/api/v1/applications/${applyRes.body.data._id}/status`)
      .set('Authorization', `Bearer ${tpoToken}`)
      .send({ status: 'shortlisted' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('shortlisted');
  });

  it('rejects an invalid state transition (applied -> selected, skipping intermediate states)', async () => {
    const { branch, drive, tpoToken } = await setupEligibleDrive();
    const { accessToken } = await createVerifiedStudent(branch._id);

    const applyRes = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ driveId: drive._id });

    const res = await request(app)
      .patch(`/api/v1/applications/${applyRes.body.data._id}/status`)
      .set('Authorization', `Bearer ${tpoToken}`)
      .send({ status: 'selected' });

    expect(res.status).toBe(400);
  });
});
