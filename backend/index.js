// built-in modules
const express = require("express");
const path = require("path");

const cors = require("cors");
const mongoose = require("mongoose");

const { generateFile } = require("./generateFile");
const { executeCpp } = require("./executeCpp");
const { executePy } = require("./executePy");
const Job = require("./models/Job");

mongoose.connect("mongodb://localhost:27017/compilerApp", (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log("Successfully connected to mongodb database");
});

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/status", async (req, res) => {
  const jobid = req.query.id;

  if (jobid == undefined) {
    return res
      .status(400)
      .json({ success: false, error: "missing id query parameter" });
  }

  try {
    const job = await Job.findById(jobid);

    if (job == undefined) {
      return res.status(404).json({ success: false, error: "missing job" });
    }

    return res.status(200).json({ success: true, job: job });
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, error: err.message, message: "invalid job id" });
  }
});

// post request for sending ans executing the code
app.post("/run", async (req, res) => {
  const { language = "cpp", code } = req.body;

  if (code === undefined) {
    return res.status(400).json({ success: false, error: "Empty code body" });
  }

  let job;
  try {
    // need to generate a c++ file with content from the req body
    const filepath = await generateFile(language, code);

    // since we know that we require filepath
    //to save it in db, so we save it after the filepath is generated
    job = await new Job({ language, filepath }).save();
    const jobID = job["_id"];

    res.status(201).json({ success: true, jobID });

    // we need to run the file and send the res
    let output;

    job["startedAt"] = new Date();
    if (language === "cpp") {
      output = await executeCpp(filepath);
    }

    if (language === "py") {
      output = await executePy(filepath);
    }

    job["completedAt"] = new Date();
    job["status"] = "success";
    job["output"] = output;

    await job.save();
    // as we have assigned a res already
    // rewriting it will give us over writing error
    // return res.json({ filepath, output });
  } catch (err) {
    // same comment as above
    // res.status(500).json({ err });

    job["completedAt"] = new Date();
    job["status"] = "error";
    job["output"] = JSON.stringify(err);

    await job.save();
  }
});

app.listen(5000, () => {
  console.log("Listening on port 5000");
});
