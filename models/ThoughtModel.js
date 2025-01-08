import mongoose, { Schema } from "mongoose";

const ThoughtSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140,
  },
  hearts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    required: true,
    default: () => new Date(),
  },
});

export const Thought = mongoose.model("Thought", ThoughtSchema);
