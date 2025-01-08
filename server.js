import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Thought } from "./models/ThoughtModel";
import expressListEndpoints from "express-list-endpoints";

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

// Define the routes
app.get("/", (req, res) => {
  res.json(expressListEndpoints(app)); // Sends a JSON response with all routes
});

// Define a route to fetch thoughts
app.get("/thoughts", async (req, res) => {
  // Use the Thought model to get all thoughts from the database
  const thoughts = await Thought.find()
    .sort({ createdAt: "desc" }) // Sort them by creation date (descending order)
    .limit(20) // Limit the results to 20 thoughts
    .exec(); // Execute the query
  res.json(thoughts);
});

// Define a route to post (create) a new thought
app.post("/thoughts", async (req, res) => {
  // Extract only the "message" field from the request body (not hearts and createdAt)
  const { message } = req.body;

  // Create a new thought using the Thought model
  const thought = new Thought({ message });

  try {
    // Try to save the new thought to the database
    const savedThought = await thought.save();
    res.status(201).json(savedThought); // Send the saved thought as a response
  } catch (err) {
    res.status(400).json({
      message: "Could not save thought to database",
      error: err.errors,
    });
  }
});

// Define a route to "like" a thought
app.post("/thoughts/:thoughtId/like", async (req, res) => {
  // Extract the thought ID from the URL parameter
  const { thoughtId } = req.params;

  try {
    // Find the thought by ID and increment the "hearts" by 1
    const updatedThought = await Thought.findByIdAndUpdate(
      thoughtId,
      { $inc: { hearts: 1 } }, // Increments hearts with 1
      { new: true } // Return the updated thought
    );

    if (updatedThought) {
      res.status(200).json(updatedThought); //Send the updated thought as a response
    } else {
      res.status(404).json({ message: "Thought not found" }); // If no thought was found, send a 404 response
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
