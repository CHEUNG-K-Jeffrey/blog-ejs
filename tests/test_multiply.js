"use strict";
const multiply = require("../utils/multiply");
const expect = require("chai").expect;
const { describe, it } = require("mocha");

describe("testing multiply", () => {
  it("should give 7*6 is 42", (done) => {
    expect(multiply(7, 6)).to.equal(42);
    done();
  });
});
