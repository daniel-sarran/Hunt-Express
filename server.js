const mongoose = require("mongoose");
const jobs = require("./routes/jobs");
const config = require("config");
const morgan = require("morgan");
const helmet = require("helmet");
const debug = require("debug")("app:startup");
const express = require("express");
const { Job } = require("./models/job");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/jobs", jobs);
app.use(express.static("public"));
app.use(helmet());

// Configuration
console.log(`Application Name: ${config.get("name")}`);

if (app.get("env") === "development") {
  app.use(morgan("tiny"));
  debug("Morgan enabled...");
}

// Will be a different connection string for production
// TODO: connection string should come from configuration file
const mongodb = process.env.MONGODB_URL || "mongodb://localhost:27017/hunt";
const user = process.env.MONGODB_USER || "";
const password = process.env.MONGODB_PASSWORD || "";

mongoose
  .connect(mongodb, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    user: user,
    pass: password,
  })
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

app.get("/", (req, res) => {
  const test = {
    greeting: "hello!",
  };
  JSON.stringify(test);
  res.send();
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Listening on port ${port}...\n
If AWS: http://ec2-18-222-26-166.us-east-2.compute.amazonaws.com:${port}/`)
);
