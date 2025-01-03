import express from "express";
import { createCourse, createLecture, editCourse, editLecture, getAllAdminCourses, getCourseById, getCourseLecture, getLectureById, getPublishedCourse, removeLecture, searchCourse, togglePublicCourse } from "../controllers/courseController";
import { isAdmin, isAuthenticated } from "../middlewares/isAuthenticated";
import upload from "../utils/multer";

const router = express.Router();

router.route("/create-course").post(isAuthenticated, isAdmin, createCourse)
router.route("/search").get(isAuthenticated, searchCourse);
router.route("/courses").get(isAuthenticated, getAllAdminCourses)
router.route("/getCourseById/:courseId").get(isAuthenticated, isAdmin, getCourseById)
router.route("/courses/:courseId").put(isAuthenticated, isAdmin, upload.single("courseThumbnail"), editCourse)
router.route("/create-lecture/:courseId").post(isAuthenticated, isAdmin, createLecture)
router.route("/getCourseLecture/:courseId").get(isAuthenticated, isAdmin, getCourseLecture)
router.route("/lectures/:courseId/:lectureId").put(isAuthenticated, isAdmin, upload.single("videoFile"), editLecture);
router.route("/remove-lecture/:lectureId").delete(isAuthenticated, isAdmin, removeLecture)
router.route("/getLectureById/:lectureId").get(isAuthenticated, isAdmin, getLectureById)
router.route("/publish-course/:courseId").patch(isAuthenticated, isAdmin, togglePublicCourse)
router.route("/getPublishedCourse").get(isAuthenticated, getPublishedCourse)

export default router;