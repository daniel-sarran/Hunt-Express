const mongoose = require("mongoose");
const jobs = require("./routes/jobs");
const helmet = require("helmet");
const express = require("express");
const { Job } = require("./models/job");
const app = express();
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/jobs", jobs);
app.use(express.static("public"));
app.use(helmet());

const uri = process.env.ATLAS_URI || "mongodb://localhost:27017/hunt";
const connectionParams = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(uri, connectionParams)
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => {
    console.error("Could not connect to MongoDB...", err);
    process.exit(1);
  });

mongoose.set("useFindAndModify", false);

const port = process.env.PORT || 80;
app.listen(port, () => console.log(`Listening on port ${port}...`));
