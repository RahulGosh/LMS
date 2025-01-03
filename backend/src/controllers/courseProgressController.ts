import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/types";
import { CourseProgress } from "../models/courseProgressModel";
import { Course } from "../models/courseModel";

export const getCourseProgress = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { courseId } = req.params
        const userId = req.user?._id;

        let courseProgress = await CourseProgress.findOne({ courseId, userId }).populate("courseId")

        const courseDetails = await Course.findById(courseId).populate("lectures")

        if (!courseDetails) {
            res.status(404).json({
                success: false,
                message: "Course not found!"
            })
            return;
        }

        if (!courseProgress) {
            res.status(200).json({
                data: {
                    courseDetails,
                    progress: [],
                    completed: false,
                }
            })
            return;
        }

        res.status(200).json({
            data: {
                courseDetails,
                progress: courseProgress.lectureProgress,
                completed: courseProgress.completed,
            },
        });
        return;
    } catch (error) {
        console.log(error)
    }
}

export const updateLectureProgress = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { courseId, lectureId } = req.params;
        const userId = req.user?._id;

        let courseProgress = await CourseProgress.findOne({ courseId, userId });

        if (!courseProgress) {
            courseProgress = new CourseProgress({
                userId,
                courseId,
                completed: false,
                lectureProgress: [],
            });
        }

        const lectureIndex = courseProgress.lectureProgress.findIndex(
            (lecture) => lecture.lectureId === lectureId
        );

        if (lectureIndex !== -1) {
            courseProgress.lectureProgress[lectureIndex].viewed = true;
        } else {
            courseProgress.lectureProgress.push({
                lectureId,
                viewed: true,
            });
        }

        const lectureProgressLength = courseProgress.lectureProgress.filter(
            (lectureProg) => lectureProg.viewed
        ).length;

        const course = await Course.findById(courseId);

        if (course && course.lectures.length === lectureProgressLength) {
            courseProgress.completed = true;
        }

        await courseProgress.save();

        res.status(200).json({
            success: true,
            message: "Lecture progress updated successfully!",
        });
        return;
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const markAsCompleted = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { courseId } = req.params;
        const userId = req.user?._id;

        const courseProgress = await CourseProgress.findOne({ courseId, userId })
        if (!courseProgress) {
            res.status(404).json({
                success: false,
                message: "Course Progress not found"
            })
            return;
        }

        courseProgress.lectureProgress.map(
            (lectureProgress) => (lectureProgress.viewed = true)
        )
        courseProgress.completed = true;
        await courseProgress.save()
        res.status(200).json({
            success: true,
            message: "Course marked as completed"
        })
        return;
    } catch (error) {
        console.log(error)
    }
}

export const markAsInCompleted = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { courseId } = req.params;
        const userId = req.user?._id

        const courseProgress = await CourseProgress.findOne({ courseId, userId })
        if (!courseProgress) {
            res.status(404).json({
                success: false,
                message: "Course Progress not found"
            })
            return;
        }

        courseProgress.lectureProgress.map(
            (lectureProgress) => (lectureProgress.viewed = false)
        )

        courseProgress.completed = false,
            await courseProgress.save()

        res.status(200).json({
            success: true,
            message: "Course marked as incompleted"
        })
        return;
    } catch (error) {
        console.log(error)
    }
}