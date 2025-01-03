import mongoose, { Document, Schema, Model } from "mongoose";

// Define an interface for LectureProgress
export interface LectureProgressType {
    lectureId: string;
    viewed: boolean;
}

// Define an interface for CourseProgress
export interface CourseProgressType extends Document {
    userId: string;
    courseId: string;
    completed: boolean;
    lectureProgress: LectureProgressType[];
}

// Create the lectureProgressSchema
const lectureProgressSchema = new Schema<LectureProgressType>({
    lectureId: { type: String, required: true },
    viewed: { type: Boolean, required: true },
});

// Create the courseProgressSchema
const courseProgressSchema = new Schema<CourseProgressType>({
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    completed: { type: Boolean, required: true },
    lectureProgress: { type: [lectureProgressSchema], required: true },
});

// Export the CourseProgress model
export const CourseProgress: Model<CourseProgressType> = mongoose.model<CourseProgressType>(
    "CourseProgress",
    courseProgressSchema
);
