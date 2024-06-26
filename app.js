const helmet = require("helmet");
const xss = require("xss-clean");
const express = require("express");
require("express-async-errors");

const app = express();

const rateLimit = require("express-rate-limit").rateLimit;

// Apply the rate limiting middleware to all requests.
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
}));

app.use(helmet());
app.use(xss());

require("dotenv").config(); // to load the .env file into the process.env object
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const url = process.env.MONGO_URI;

const store = new MongoDBStore({
  // may throw an error, which won't be caught
  uri: url,
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});

const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParms.cookie.secure = true; // serve secure cookies
}

const cookieParser = require("cookie-parser");
const csrf = require("host-csrf");

app.use(cookieParser("process.env.SESSION_SECRET"));
app.use(express.urlencoded({ extended: false }));
let csrf_development_mode = true;
if (app.get("env") === "production") {
  csrf_development_mode = false;
  app.set("trust proxy", 1);
}
const csrf_options = {
  protected_operations: ["PATCH"],
  protected_content_types: ["application/json"],
  development_mode: csrf_development_mode,
};
const csrf_middleware = csrf(csrf_options); //initialise and return middlware
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(session(sessionParms));
const passport = require("passport");
const passportInit = require("./passport/passportInit");

passportInit();
app.use(passport.initialize());
app.use(passport.session());
app.use(require("connect-flash")());
app.use(require("./middleware/storeLocals"));
app.use(csrf_middleware);

// ROUTES

app.get("/", (req, res) => {
  res.render("index");
});
app.use("/sessions", require("./routes/sessionRoutes"));

app.get("/multiply", (req, res) => {
  let result = req.query.first * req.query.second;
  if (result.isNaN) {
    result = "NaN";
  } else if (result == null) {
    result = "null";
  }
  res.json({ result: result });
});

app.set("view engine", "ejs");

// secret word handling
// let secretWord = "syzygy"; <-- comment this out or remove this line
const secretWordRouter = require("./routes/secretWord");
const auth = require("./middleware/auth");
app.use("/secretWord", auth, secretWordRouter);
app.use("/secretWord", secretWordRouter);
const jobs = require("./routes/jobs");
app.use("/jobs", auth, jobs);

app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res) => {
  res.status(500).send(err.message);
  console.log(err);
});

const port = process.env.PORT || 3000;

const start = () => {
  try {
    let mongoURL = process.env.MONGO_URI;
    if (process.env.NODE_ENV == "test") {
      mongoURL = process.env.MONGO_URI_TEST;
    }
    require("./db/connect")(mongoURL);
    return app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

const server = start();

module.exports = { app, server };
