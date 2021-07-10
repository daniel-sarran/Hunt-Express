const Joi = require("joi");
const mongoose = require("mongoose");

const Job = mongoose.model("Job", new mongoose.Schema({
    company: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 255,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 255,
    },
    dateApplied: {
      type: Date,
      required: true,
    },
    stage: {
      type: String,
      default: "application submitted",
      enum: [
        "application submitted",
        "online assessment",
        "interview: phone",
        "interview: video",
        "interview: face-to-face",
        "rejection",
        "offer",
      ],
      lowercase: true,
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 255,
    },
  })
);

function validateJob(job) {
  const schema = Joi.object({
    company: Joi.string().min(1).required(),
    position: Joi.string().min(1).required(),
    dateApplied: Joi.date().required(),
    stage: Joi.string()
      .valid(
        "application submitted",
        "online assessment",
        "interview: phone",
        "interview: video",
        "interview: face-to-face",
        "rejection",
        "offer"
      )
      .required(),
    notes: Joi.string(),
  });

  return schema.validate(job);
}

exports.Job = Job;
exports.validate = validateJob;
