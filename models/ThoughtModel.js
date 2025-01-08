import mongoose from "mongoose";

const { Schema } = mongoose;

const ThoughtSchema = new Schema({
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
