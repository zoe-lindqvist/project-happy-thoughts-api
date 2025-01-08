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

// Start defining route endpoint here
app.get("/", (req, res) => {
  res.json({
    endpoints: {
      fetchThoughts: "GET /thoughts",
      postThought: "POST /thoughts",
      likeThought: "PATCH /thoughts/:thoughtId/like",
    },
  });
});

// Fetch the 20 latest thoughts in desc order
app.get("/thoughts", async (req, res) => {
  try {
    const thoughts = await Thought.find().sort({ createdAt: -1 }).limit(20);
    res.json(thoughts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching thoughts" });
  }
});

// Post a new thought/message
app.post("/thoughts", async (req, res) => {
  const { message } = req.body;

  try {
    // Validation of characters
    if (!message || message.length < 5 || message.length > 140) {
      throw new Error("Message must be between 5 and 140 characters");
    }

    // Create and save a new thought/message
    const newThought = await new Thought({ message }).save();

    res.status(201).json({
      success: true,
      response: newThought,
      message: "Thought was successfully created!",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      response: error.message,
      message: "Failed to post thought",
    });
  }
});

// Increase the hearts count
app.patch("/thoughts/:thoughtId/like", async (req, res) => {
  const { thoughtId } = req.params;

  try {
    // Find thought by ID
    const updatedThought = await Thought.findByIdAndUpdate(
      thoughtId,
      { $inc: { hearts: 1 } }, // Increment the hearts field by 1
      { new: true }
    );

    // If no thought is found, throw an error
    if (!updatedThought) {
      throw new Error("Thought not found");
    }

    // Send a success response with the updated thought
    res.status(200).json({
      success: true,
      response: updatedThought,
      message: "Successfully liked the thought!",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      response: error.message,
      message: "Failed to like thought",
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
