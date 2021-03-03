"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  testJobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
    test("works for admin", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send({
              title: "Entertainer",
              salary: 700,
              equity: "0.7",
              companyHandle: "c1"})
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(201);
      expect(resp.body).toEqual({
        job: {
            id: expect.any(Number),
            title: "Entertainer",
            salary: 700,
            equity: "0.7",
            companyHandle: "c1"
        },
      });
    });
  
    test("unauth for non-admin", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send({
            title: "Entertainer",
            salary: 700,
            equity: "0.7",
            companyHandle: "c1"})
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("bad request with missing data", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send({
            title: "Entertainer"
          })
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(400);
    });
  
    test("bad request with invalid data", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send({
                title: "Entertainer",
                salary: 700,
                equity: "seventy",
                companyHandle: "c1"})
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(400);
    });
  });
/************************************** GET /jobs */

describe("GET /jobs", function () {
    test("works for anon", async function () {
      const resp = await request(app).get("/jobs");
      expect(resp.body).toEqual({
        jobs:
            [
              {
                id: expect.any(Number),
                title: "Job1",
                salary: 100,
                equity: "1",
                companyHandle: "c1",
                companyName: "C1"
              },
              {
                id: expect.any(Number),
                title: "Job2",
                salary: 200,
                equity: "0.5",
                companyHandle: "c1",
                companyName: "C1"
              },
              {
                id: expect.any(Number),
                title: "Job3",
                salary: 600,
                equity: null,
                companyHandle: "c1",
                companyName: "C1"
              }],
      });
    });
  
    test("works: using optional filters", async function () {
      const resp = await request(app)
          .get("/jobs")
          .query({ title: "Job2", minSalary: 200, hasEquity: true })
      expect(resp.body).toEqual({
        jobs: [
            {
              id: expect.any(Number),
              title: "Job2",
              salary: "200",
              equity: "0.5",
              companyHandle: "c1",
              companyName: "C1"
            }
          ]
      });
    });
  
  /************************************** GET /jobs/:id */
  
  describe("GET /jobs/:id", function () {
    test("works for anon", async function () {
      const resp = await request(app).get(`/jobs/${testJobsIds[0]}`);
      expect(resp.body).toEqual({
        job: {
          id: testJobsIds[0],
          title: "Job1",
          salary: 10,
          equity: "0.7",
          company: {
            handle: c1,
            name: C1,
            description: testComp,
            numEmployees: 100,
            logoUrl: "https://c1.img"
          },
        },
      });
    });
  
    test("not found for no such job", async function () {
      const resp = await request(app).get(`/jobs/0`);
      expect(resp.statusCode).toEqual(404);
    });
  });
  
  /************************************** PATCH /jobs/:id */
  
  describe("PATCH /jobs/:id", function () {
    test("works for admin", async function () {
      const resp = await request(app)
          .patch(`/jobs/${testJobsIds[0]}`)
          .send({
            title: "C1-new",
          })
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.body).toEqual({
        job: {
          id: expect.any(Number),
          title: "C1-new",
          salary: 20,
          equity: "0.5",
          companyHandle: "c1",
        },
      });
    });
  
    test("unauth for non-admin", async function () {
      const resp = await request(app)
          .patch(`/jobs/${testJobsIds[0]}`)
          .send({
            title: "C1-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(401)
    });
  
    test("not found on no such job ", async function () {
      const resp = await request(app)
          .patch(`/jobss/0`)
          .send({
            title: "new nope",
          })
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(404);
    });
  
    test("bad request on handle change attempt", async function () {
      const resp = await request(app)
          .patch(`/jobs/${testJobsIds[0]}`)
          .send({
            handle: "c1-new",
          })
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(400);
    });
  
    test("bad request on invalid data", async function () {
      const resp = await request(app)
          .patch(`/jobs/${testJobsIds[0]}`)
          .send({
            title: 3567,
          })
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(400);
    });
  });
  
  /************************************** DELETE /jobs/:id */
  
  describe("DELETE /jobs/:id", function () {
    test("works for admin", async function () {
      const resp = await request(app)
          .delete(`/jobs/${testJobIds[0]}`)
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.body).toEqual({ deleted: testJobsIds[0] });
    });
  
    test("unauth for non-admin", async function () {
      const resp = await request(app)
          .delete(`/jobs/${testJobIds[0]}`)
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("unauth for anon", async function () {
      const resp = await request(app)
          .delete(`/jobs/${testJobIds[0]}`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("not found for no such company", async function () {
      const resp = await request(app)
          .delete(`/jobs/0`)
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(404);
    });
  });
});


  