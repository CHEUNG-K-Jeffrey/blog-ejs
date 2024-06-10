const Job = require("../models/Job");
const parseVErr = require("../util/parseValidationErr");


const jobsGet = async (req, res, next) => {
    let jobs;
  try {
    jobs = await Job.find({createdBy: req.user._id})
  } catch (e) {
    if (e.constructor.name === "ValidationError") {
      parseVErr(e, req);
    } else {
      return next(e);
    }
    return res.render("register", {  errors: req.flash("errors") });
  }
    res.render("jobs", { jobs });
}

const jobsPost = async (req, res, next) => {
    try {
    await Job.create({...req.body, createdBy: req.user._id });
  } catch (e) {
    if (e.constructor.name === "ValidationError") {
      parseVErr(e, req);
    }else {
      return next(e);
    }
    return res.render("register", {  errors: req.flash("errors") });
  }
  res.redirect("/jobs");
}

const jobsNew = (req, res) => {
  res.render("job", { job: null })
}

const jobsEdit = async (req, res, next) => {
  let job;
  try {
    job = await Job.findOne({_id: req.params.id, createdBy: req.user._id});
  } catch (e) {
    if (e.constructor.name === "ValidationError") {
      parseVErr(e, req);
    } else {
      return next(e);
    }
    return res.render("register", {  errors: req.flash("errors") });
  }
  res.render("job", { job })
}

const jobsUpdate = async (req, res, next) => {
  try {
    await Job.findOneAndUpdate({_id: req.params.id, createdBy: req.user._id}, {...req.body});
  } catch (e) {
    if (e.constructor.name === "ValidationError") {
      parseVErr(e, req);
    } else {
      return next(e);
    }
    return res.render("register", {  errors: req.flash("errors") });
  }
  res.redirect("/jobs");
}
const jobsDelete = async (req, res, next) => {

    try {
    await Job.deleteOne({_id: req.params.id, createdBy: req.user._id});
  } catch (e) {
    if (e.constructor.name === "ValidationError") {
      parseVErr(e, req);
    } else {
      return next(e);
    }
    return res.render("register", {  errors: req.flash("errors") });
  }
  res.redirect("/jobs");
}

module.exports = {
  jobsGet,
  jobsPost,
  jobsNew,
  jobsEdit,
  jobsUpdate,
  jobsDelete
};