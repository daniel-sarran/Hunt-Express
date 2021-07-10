const { Job, validate } = require("../models/job");

const config = require("config");
const morgan = require("morgan");
const helmet = require("helmet");

const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(helmet());

router.get("/", async (req, res) => {
  const jobs = await Job.find().sort("dateApplied");
  res.send(jobs);
});

router.get("/:id", async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return res.status(404).send("Application with given ID not found.");
  }

  res.send(job);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  let job = new Job({
    company: req.body.company,
    position: req.body.position,
    dateApplied: req.body.dateApplied,
    stage: req.body.stage,
    notes: req.body.notes,
  });
  job = await job.save();

  res.send(job);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const job = await Job.findByIdAndUpdate(
    req.params.id,
    {
      company: req.body.company,
      position: req.body.position,
      dateApplied: req.body.dateApplied,
      stage: req.body.stage,
      notes: req.body.notes,
    },
    {
      new: true,
    }
  );
  if (!job) {
    return res.status(404).send("Job application with given ID not found.");
  }

  res.send(job);
});

router.delete("/:id", async (req, res) => {
  const job = await Job.findByIdAndRemove(req.params.id);
  if (!job) {
    return res.status(404).send("Job application with given ID not found.");
  }

  res.send(job);
});

module.exports = router;
