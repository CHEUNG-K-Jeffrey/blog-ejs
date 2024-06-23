import express from "express";
import { Request, Response } from "express";
import helmet from "helmet";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import xss from "xss-clean";
import { doubleCsrf } from "csrf-csrf";

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

// Configure app
app.set("view engine", "ejs");
app.use(doubleCsrfProtection);

// Configure Routes
app.get("/", (req: Request, res: Response) => {
  res.send(`Hello World!`);
});

app.get("*", (req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
});

// Start server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
