import express from "express";
import helmet from "helmet";
import xss from "xss-clean";

const app = express();
let port = 3000;

// Read config

// Configure middleware
app.use(
  (await import("express-rate-limit")).rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
  })
);
app.use(helmet());
app.use(xss());

// Configure Routes
app.get("/", (req, res) => {
  res.send(`Hello World!`);
});

// Start server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
