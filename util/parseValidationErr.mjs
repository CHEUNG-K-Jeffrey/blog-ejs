const parseValidationErrors = (err, req) => {
  const keys = Object.keys(err.errors);
  keys.forEach((key) => {
    req.flash("error", key + ": " + err.errors[key].properties.message);
  });
};

export default parseValidationErrors;
