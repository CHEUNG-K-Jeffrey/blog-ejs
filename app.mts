import express from "express";

const app = express();
let port = 3000;

// Read config

// Configure middleware

// Configure Routes
app.get("/", (req, res) => {
  res.send(`Hello World!`);
});

// Start server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
