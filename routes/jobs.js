const express = require("express");
const passport = require("passport");
const router = express.Router();

const {
  jobsGet,
  jobsPost,
  jobsNew,
  jobsEdit,
  jobsUpdate,
  jobsDelete
} = require("../controllers/jobs");

router.route("/").get(jobsGet).post(jobsPost);
router.route("/new").get(jobsNew);
router.route("/edit/:id").get(jobsEdit);
router.route("/update/:id").post(jobsUpdate);
router.route("/delete/:id").post(jobsDelete);

module.exports = router;