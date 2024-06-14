"use strict";
const multiply = require("../utils/multiply");
const expect = require("chai").expect;
const { after, describe, it } = require("mocha");
const { server } = require("../app");

describe("testing multiply", () => {
  after(() => {
    server.close();
  });
  it("should give 7*6 is 42", (done) => {
    expect(multiply(7, 6)).to.equal(42);
    done();
  });
});
