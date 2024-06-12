const chai = require("chai");
chai.use(require("chai-http"));
const puppeteer = require("puppeteer");
const { server } = require("../app");
const { seed_db, testUserPassword } = require("../utils/seed_db");
const { describe, before, after, it } = require("mocha");
const { expect } = chai;
const { factory } = require("../utils/seed_db");
const Jobs = require("../models/Job");

let testUser = null;

const runTests = async () => {
  let page = null;
  let browser = null;
  // Launch the browser and open a new blank page
  describe("index page test", function () {
    before(async function () {
      server.listen(3000);
      this.timeout(30000);
      browser = await puppeteer.launch({ headless: false, slowMo: 100 });
      page = await browser.newPage();
      await page.goto("http://localhost:3000");
      // server.listen(3000).addListener("listening", async () => {
      // });
    });
    after(async function () {
      this.timeout(32000);
      await browser.close();
      server.close();
      return;
    });
    describe("got to site", function () {
      it("should have completed a connection", function () {});
    });
    describe("index page test", function () {
      this.timeout(20000);
      it("finds the index page logon link", async () => {
        this.logonLink = await page.waitForSelector(
          "a ::-p-text(Click this link to logon)"
        );
      });
      it("gets to the logon page", async () => {
        await this.logonLink.click();
        await page.waitForNavigation();
      });
    });
    describe("logon page test", function () {
      console.log("at line 48", this.outerd, this.innerd, this.secondIt);
      this.timeout(20000);
      it("resolves all the fields", async () => {
        this.timeout(20000);
        this.email = await page.waitForSelector("input[name=email]");
        this.password = await page.waitForSelector("input[name=password]");
        this.submit = await page.waitForSelector("button ::-p-text(Logon)");
      });
      it("sends the logon", async () => {
        this.timeout(20000);
        testUser = await seed_db();
        await this.email.type(testUser.email);
        await this.password.type(testUserPassword);
        await this.submit.click();
        await page.waitForNavigation();
        await page.waitForSelector(
          `p ::-p-text(${testUser.name} is logged on.)`
        );
        await page.waitForSelector("a ::-p-text(change the secret");
        await page.waitForSelector('a[href="/secretWord"]');
        const copyr = await page.waitForSelector("p ::-p-text(copyright)");
        const copyrText = await copyr.evaluate((el) => el.textContent);
        console.log("copyright text: ", copyrText);
      });
    });
    describe("jobs page test", function () {
      this.timeout(20000);
      it("finds the index page logon link", async () => {
        this.jobLink = await page.waitForSelector('a[href="/jobs"]');
      });
      it("gets to the job page", async () => {
        this.timeout(20000);
        await this.jobLink.click();
        await page.waitForNavigation();
        const content = await page.content();
        expect(content.split("<tr>").length).equal(21);
      });
      it("clicks add a job button", async () => {
        this.timeout(20000);
        this.jobAdd = await page.waitForSelector('a[href="/jobs/new"]');
        await this.jobAdd.click();
        await page.waitForNavigation();
      });
      it("resolves all the job fields", async () => {
        this.timeout(20000);
        this.company = await page.waitForSelector("input[name=company]");
        this.position = await page.waitForSelector("input[name=position]");
        this.status = await page.waitForSelector("select[name=status]");
        this.addJob = await page.waitForSelector("button ::-p-text(add)");
      });
      let job;
      it("sends new job", async () => {
        this.timeout(20000);
        job = await factory.build("job");
        await this.company.type(job.company);
        await this.position.type(job.position);
        await this.addJob.click();
        await page.waitForNavigation();
        await page.waitForSelector("p::-p-text(Added New Job)");
      });
      it("checks the job against database", async () => {
        this.timeout(20000);
        await page.waitForSelector("table");
        let result = await Jobs.find({
          company: job.company,
          position: job.position,
        });
        console.log(result);
        expect(result.length).to.equal(1);
      });
    });
  });
};

runTests();
