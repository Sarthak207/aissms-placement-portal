const mongoose = require('mongoose');
const PlacementDrive = require('../../src/models/PlacementDrive');

function makeDrive(overrides = {}) {
  return new PlacementDrive({
    companyId: new mongoose.Types.ObjectId(),
    title: 'SDE Drive',
    role: 'Software Engineer',
    type: 'full_time',
    applicationDeadline: new Date(Date.now() + 86400000),
    eligibility: {
      minCgpa: 7,
      maxLiveBacklogs: 0,
      maxHistoryBacklogs: 1,
      allowedBranches: [],
      allowedPassingYears: [],
      ...overrides.eligibility,
    },
    ...overrides,
  });
}

function makeStudent(overrides = {}) {
  return {
    cgpa: 8,
    liveBacklogs: 0,
    historyBacklogs: 0,
    branchId: new mongoose.Types.ObjectId(),
    passingYear: 2026,
    ...overrides,
  };
}

describe('PlacementDrive.isStudentEligible', () => {
  it('allows a student who meets every criterion', () => {
    const drive = makeDrive();
    const student = makeStudent();
    expect(drive.isStudentEligible(student)).toBe(true);
  });

  it('rejects a student below the minimum CGPA', () => {
    const drive = makeDrive();
    const student = makeStudent({ cgpa: 6.5 });
    expect(drive.isStudentEligible(student)).toBe(false);
  });

  it('rejects a student with more live backlogs than allowed', () => {
    const drive = makeDrive({ eligibility: { maxLiveBacklogs: 0 } });
    const student = makeStudent({ liveBacklogs: 1 });
    expect(drive.isStudentEligible(student)).toBe(false);
  });

  it('rejects a student with more history backlogs than allowed', () => {
    const drive = makeDrive({ eligibility: { maxHistoryBacklogs: 1 } });
    const student = makeStudent({ historyBacklogs: 2 });
    expect(drive.isStudentEligible(student)).toBe(false);
  });

  it('rejects a student whose branch is not in the allow-list when one is set', () => {
    const allowedBranch = new mongoose.Types.ObjectId();
    const drive = makeDrive({ eligibility: { allowedBranches: [allowedBranch] } });
    const student = makeStudent({ branchId: new mongoose.Types.ObjectId() });
    expect(drive.isStudentEligible(student)).toBe(false);
  });

  it('allows a student whose branch IS in the allow-list', () => {
    const allowedBranch = new mongoose.Types.ObjectId();
    const drive = makeDrive({ eligibility: { allowedBranches: [allowedBranch] } });
    const student = makeStudent({ branchId: allowedBranch });
    expect(drive.isStudentEligible(student)).toBe(true);
  });

  it('rejects a student outside the allowed passing years when set', () => {
    const drive = makeDrive({ eligibility: { allowedPassingYears: [2025] } });
    const student = makeStudent({ passingYear: 2026 });
    expect(drive.isStudentEligible(student)).toBe(false);
  });

  it('imposes no branch/year restriction when the allow-lists are empty', () => {
    const drive = makeDrive({ eligibility: { allowedBranches: [], allowedPassingYears: [] } });
    const student = makeStudent({ branchId: new mongoose.Types.ObjectId(), passingYear: 1999 });
    expect(drive.isStudentEligible(student)).toBe(true);
  });
});
