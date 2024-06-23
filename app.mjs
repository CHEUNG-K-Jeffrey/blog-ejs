import express from "express";
import helmet from "helmet";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import xss from "xss-clean";
import { doubleCsrf } from "csrf-csrf";
import flash from "connect-flash";
import passport from "passport";

// Read and load config
(await import("dotenv")).config();

// Initialize the app
const app = express();
const port = process.env.PORT ?? 3000;
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  console.error("SESSION_SECRET was not found in .env");
  process.exit(1);
}

const {
  doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf({
  getSecret: () => "Secret", // A function that optionally takes the request and returns a secret
  cookieName: "__Host-psifi.x-csrf-token", // The name of the cookie to be used, recommend using Host prefix.
  cookieOptions: {
    sameSite: "lax", // Recommend you make this strict if posible
    path: "/",
    secure: process.env.NODE_ENV === "production",
    signed: true,
  },
  size: 64, // The size of the generated tokens in bits
  ignoredMethods: ["GET", "HEAD", "OPTIONS"], // A list of request methods that will not be protected.
  getTokenFromRequest: (req) => req.headers["x-csrf-token"], // A function that returns the token from the request
});

// Load middleware
app.use(
  (await import("express-rate-limit")).rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
  })
); // Rate limit by IP
app.use(helmet()); // Increases security by setting HTTP response headers
app.use(xss()); // Prevent cross-site scripting
app.use((await import("cookie-parser")).default(sessionSecret));

const session = (await import("express-session")).default;
const MongoDBStore = (await import("connect-mongodb-session")).default(session);
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

app.use(session(sessionParms));
(await import("./passport/passportInit.mjs")).default();
app.use(passport.initialize());
app.use(passport.session());
// Configure app
app.use(flash());
app.set("view engine", "ejs");
app.use(doubleCsrfProtection);

// Configure Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("*", (req, res) => {
  res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
});

// Start server
const mongoURL = process.env.MONGO_URI;

(await import("./db/connect.mjs")).default(mongoURL);
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
