import mongoose, { Schema, Document, Model } from "mongoose";

// Define an interface for the Course document
export interface CourseType extends Document {
  courseTitle: string;
  subTitle?: string;
  description?: string;
  category: string;
  courseLevel?: "Beginner" | "Medium" | "Advance";
  coursePrice?: number;
  courseThumbnail?: string;
  enrolledStudents: mongoose.Types.ObjectId[];
  lectures: mongoose.Types.ObjectId[];
  creator: mongoose.Types.ObjectId;
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the schema
const courseSchema: Schema<CourseType> = new mongoose.Schema(
  {
    courseTitle: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    courseLevel: {
      type: String,
      enum: ["Beginner", "Medium", "Advance"],
      default: "Beginner"
    },
    coursePrice: {
      type: Number,
    },
    courseThumbnail: {
      type: String,
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
      },
    ],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Export the Course model
export const Course: Model<CourseType> = mongoose.model<CourseType>("Course", courseSchema);