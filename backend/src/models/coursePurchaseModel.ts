import mongoose, { Document, Schema } from 'mongoose';
import { CourseType } from './courseModel';

// Define the interface for the CoursePurchase document
interface CoursePurchaseType extends Document {
    courseId: CourseType;
    userId: mongoose.Schema.Types.ObjectId;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    paymentId: string;
    createdAt: Date;
    updatedAt: Date;
}

// Define the CoursePurchase schema
const coursePurchaseSchema = new Schema<CoursePurchaseType>({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    paymentId: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Export the model with the typed interface
export const CoursePurchase = mongoose.model<CoursePurchaseType>('CoursePurchase', coursePurchaseSchema);
