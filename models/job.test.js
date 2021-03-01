"use strict";

const { NotFoundError } = require("../expressError");
const db = require("../db.js");
const Job = require("./job.js")

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************************* */

describe("create", function() {
  let newJob = {
    companyHandle: "c1",
    title: "Test",
    salary: 100,
    equity: "0.1"
  }

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      ...newJob,
      id: expect.any(Number),
    });
  });
});

/************************************************* */

describe("findAll", function() {
  test("works with no filters", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: testJobsIds[0],
        title: "Professor",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1"
      },
      {
        id: testJobsIds[1],
        title: "Software Engineer",
        salary: 200,
        equity: "0",
        companyHandle: "c1",
        companyName: "C1"
      },
      {
        id: testJobsIds[2],
        title: "Unemployed",
        salary: null,
        equity: null,
        companyHandle: "c1",
        companyName: "C1"
      }
    ]);
  });

  test("works by title", async function() {
    let jobs = await Job.findAll({ title: "Engineer" })
    expect(jobs).toEqual([
      {
        id: testJobsIds[1],
        title: "Software Engineer",
        salary: 200,
        equity: "0",
        companyHandle: "c1",
        companyName: "C1"
      }
    ]);
  });

  test("works by min salary", async function() {
    let jobs = await Job.findAll({ minSalary: 200})
    expect(jobs).toEqual([
      {
        id: testJobsIds[1],
        title: "Software Engineer",
        salary: 200,
        equity: "0",
        companyHandle: "c1",
        companyName: "C1"
      }
    ]);
  });

  test("works by equity", async function() {
    let jobs = await Job.findAll({ hasEquity: false })
    expect(jobs).toEqual([
      {
        id: testJobsIds[2],
        title: "Unemployed",
        salary: null,
        equity: null,
        companyHandle: "c1",
        companyName: "C1"
      }
    ]);
  });

  test("works by min salary & equity", async function() {
    let jobs = await Job.findAll({ minSalary: 100, hasEquity: true })
    expect(jobs).toEqual([
      {
        id: testJobsIds[0],
        title: "Professor",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1"
      },
      {
        id: testJobsIds[1],
        title: "Software Engineer",
        salary: 200,
        equity: "0",
        companyHandle: "c1",
        companyName: "C1"
      }
    ]);
  });
});

/************************************************* */

describe("get", function() {
  test("works", async function() {
    let job = await Job.get(testJobsIds[0]);
    expect(job).toEqual({
      id: testJobsIds[0],
      title: "Professor",
      salary: 100,
      equity: "0.1",
      company: {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
      }
    });
  });
  test("no such job found", async function() {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy()
    }
  });
});

/************************************************* */

describe("update", function() {
  let updateData = {
    title: "New",
    salary: 500,
    equity: "0.25"
  };

  test("works", async function () {
    let job = await Job.update(testJobsIds[0], updateData);
    expect(job).toEqual({
      id: testJobsIds[0],
      companyHandle: "c1",
      ...updateData
    });
  });

  test("no such job found", async function() {
    try {
      await Job.update(0, {
        title: "test"
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy()
    }
  });
});

/************************************************* */

describe("remove", function() {
  test("works", async function() {
    await Job.remove(testJobsIds[0]);
    const res = await db.query(
        "SELECT id FROM jobs WHERE id=$1", [testJobsIds[0]]);
    expect(res.rows.length).toEqual(0);
  });

  test("no such job found", async function() {
    try {
      await Job.remove(0)
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});