"use strict";

const request = require("supertest");
const app = require("./app");


const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./routes/_testCommon");


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/******************************************* POST /auth/token */


describe("POST /auth.token", function () {
  test("works", async function () {
   const resp = await request(app)
        .post("/auth/token")
        .send({
          username: "u1",
          password: "pwd123"
        });
    expect(resp.body).toEqual({
      "token": expect.any(String),
    });
  });

  test("unauth wrong password", async function () {
    const resp = await request(app)
        .post("/auth/token")
        .send({
          username: "u1",
          password: "pwd213"
        });
    expect(resp.statusCode).toEqual(401)
  });

  test("unauth for invalid user", async function () {
    const resp = await request(app)
        .post("/auth/token")
        .send({
          username: "nunuh",
          password: "pwd123"
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/auth/token")
        .send({
          username: true,
          password: 43
        });
    expect(resp.statusCode).toEqual(400)
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/auth/token")
        .send({
          username: "u1"
        });
    expect(resp.statusCode).toEqual(400)
  });
});

/************************************************** POST /auth/register */
describe("POST /auth/register", function () {
  test("works", async function () {
    const resp = await request(app)
        .post("/auth/register")
        .send({
          username: "bluepill",
          firstName: "Morpheus",
          lastName: "toocool41",
          password: "noredpill",
          email: "matrixman@matrix.com",
        });
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      "token": expect.any(String),
    });
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/auth/register")
        .send({
          username: "bluepill",
          firstName: "not-a-name",
          lastName: "toocool41",
          password: "noredpill",
          email: "matrixman@matrix.com",
        });
    expect(resp.statusCode).toEqual(400);
    });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/auth/register")
        .send({
          password: "iamme"
        });
    expect(resp.statusCode).toEqual(400);
  });
});

