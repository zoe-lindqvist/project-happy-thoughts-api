import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Thought } from "./models/ThoughtModel";

dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/happy-thoughts";
mongoose.connect(mongoUrl);
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (req, res) => {
  res.json(expressListEndpoints(app));
});

app.get("/thoughts", async (req, res) => {
  const thoughts = await Thought.find()
    .sort({ createdAt: "desc" })
    .limit(20)
    .exec();
  res.json(thoughts);
});

app.post("/thoughts", async (req, res) => {
  //Retrieve info that is sent by the user to our API endpoint
  // I use {} around message to make sure ONLY message can be sent in by the user, not hearts and createdAt.
  const { message } = req.body;
  // Use our mongoose model to create the database entry
  const thought = new Thought({ message });

  try {
    // Success
    const savedThought = await thought.save();
    res.status(201).json(savedThought);
  } catch (err) {
    res.status(400).json({
      message: "Could not save thought to database",
      error: err.errors,
    });
  }
});

app.post("/thoughts/:thoughtId/like", async (req, res) => {
  // Get thoughtId from URL-param
  // Could also do like this: const thoughtId = req.params.thoughtId;
  const { thoughtId } = req.params;

  try {
    // Find a thought with right ID and increase hearts by 1
    const updatedThought = await Thought.findByIdAndUpdate(
      thoughtId, // Find thought based on ID
      { $inc: { hearts: 1 } }, // Increments hearts with 1
      { new: true } // Return the updated thought
    );

    if (updatedThought) {
      res.status(200).json(updatedThought); // Send back the updated thought
    } else {
      res.status(404).json({ message: "Thought not found" }); // If no thought found
    }
  } catch (err) {
    res
      .status(400)
      .json({ message: "Could not update hearts", error: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
