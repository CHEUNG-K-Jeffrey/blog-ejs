import express from "express";
import helmet from "helmet";
import xss from "xss-clean";

const app = express();
let port = 3000;

// Read config

// Configure middleware
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
