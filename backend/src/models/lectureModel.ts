import mongoose, { Document, Schema } from "mongoose";

interface LectureType extends Document {
  lectureTitle: string;
  videoUrl?: string;
  publicId?: string;
  isPreviewFree?: boolean;
}

const lectureSchema = new Schema<LectureType>({
  lectureTitle: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
  },
  publicId: {
    type: String,
  },
  isPreviewFree: {
    type: Boolean,
  },
}, { timestamps: true });

export const Lecture = mongoose.model<LectureType>("Lecture", lectureSchema);