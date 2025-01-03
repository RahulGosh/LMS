import { ParsedQs } from 'qs';
import { NextFunction, Response } from "express";
import { Course } from "../models/courseModel";
import { AuthenticatedRequest, CreateCourseCustomRequest } from "../types/types";
import { deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia } from "../utils/cloudinary";
import { Lecture } from "../models/lectureModel";
import { Types } from "mongoose";

export const createCourse = async (
  req: CreateCourseCustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseTitle, category } = req.body;

    if (!courseTitle || !category) {
      res.status(400).json({
        success: false,
        message: "Course title and category are required",
      });
      return; // Ensure no further code is executed
    }

    await Course.create({
      courseTitle,
      category,
      creator: req.user?._id || req.id,
    });

    console.log("req.id:", req.id);
    console.log("req.user:", req.user);

    res.status(201).json({
      success: true,
      message: "Course created",
    });
  } catch (error) {
    console.error("Create Course Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create the course.",
    });
  }
};

export const searchCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { query = "", sortBy = "createdAt", categories = "" } = req.query;

    const sortFields = typeof sortBy === "string" ? sortBy.split(",") : [];

    const sortOptions = sortFields.reduce<{ [key: string]: 1 | -1 }>((acc, field) => {
      let sortOrder: 1 | -1 = 1; // Explicitly type sortOrder as 1 or -1

      if (field.startsWith("-")) {
        sortOrder = -1;
      }

      const fieldName = field.replace(/^-/, "");

      if (fieldName === "price") {
        acc.coursePrice = sortOrder;
      } else if (fieldName === "title") {
        acc.courseTitle = sortOrder;
      } else if (fieldName === "createdAt") {
        acc.createdAt = sortOrder;
      } else {
        acc[fieldName] = sortOrder;
      }

      return acc;
    }, {});

    const searchCriteria: Record<string, any> = {
      isPublished: true,
      $or: [
        { courseTitle: { $regex: query, $options: "i" } },
        { subTitle: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ]
    };

    if (categories) {
      let categoryArray: string[] = [];
      
      // Check if categories is a string or an array of strings
      if (typeof categories === "string") {
        categoryArray = categories.split(",");
      } else if (Array.isArray(categories)) {
        // If categories is an array, ensure it contains strings
        categoryArray = categories.map((cat) => String(cat));
      } else if (Array.isArray(categories) && categories[0] instanceof Object) {
        // Handle case if categories contains ParsedQs[]
        categoryArray = (categories as ParsedQs[]).map((cat) => String(cat));
      }

      searchCriteria.category = { $in: categoryArray };
    }

    // Fetch the courses from the database and apply sorting
    const courses = await Course.find(searchCriteria)
      .populate({ path: "creator", select: "name photoUrl" })
      .sort(sortOptions);

    // Return the courses in the response
    res.status(200).json({
      success: true,
      courses: courses || []
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllAdminCourses = async (req: CreateCourseCustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id || req.id;
    const courses = await Course.find({ creator: userId });

    if (!courses || courses.length === 0) {
      res.status(404).json({
        courses: [],
        message: "Course not found",
      });
      return;
    }

    res.status(200).json({ courses });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};


export const getCourseById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.courseId
    const course = await Course.findById(courseId)
    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found!"
      })
      return;
    }
    console.log(course, "course")
    res.status(200).json({
      success: true,
      course
    })
    return;
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Failed to get course by Id"
    })
    return;
  }
}

export const editCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.courseId;
    const { courseTitle, subTitle, description, category, courseLevel, coursePrice } = req.body;
    const thumbnail = req.file;

    let course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found!"
      });
      return;
    }

    let courseThumbnail;
    if (thumbnail) {
      if (course && course.courseThumbnail) {
        const publicId = course.courseThumbnail.split('/').pop()?.split(".")[0];

        if (publicId) {
          await deleteMediaFromCloudinary(publicId);
        }
      }

      courseThumbnail = await uploadMedia(thumbnail.path);
    }

    const updatedData = {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
      courseThumbnail: courseThumbnail?.secure_url,
    };

    course = await Course.findByIdAndUpdate(courseId, updatedData, { new: true });

    res.status(200).json({ success: true, message: "Course updated successfully" });
    return;

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to update course" });
    return;
  }
};

export const createLecture = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.courseId;
    const { lectureTitle } = req.body;

    if (!lectureTitle || !courseId) {
      res.status(400).json({
        success: false,
        message: "Lecture title and course ID are required.",
      });
      return;
    }

    // Create the new lecture
    const lecture = await Lecture.create({ lectureTitle });

    // Find the course by ID
    const course = await Course.findById(courseId);

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found.",
      });
      return;
    }

    // Add the lecture ID to the course's lectures array
    const lectureId: Types.ObjectId = lecture._id as Types.ObjectId;
    course.lectures.push(lectureId);

    // Save the updated course
    await course.save();

    res.status(201).json({
      success: true,
      message: "Lecture created successfully.",
      lecture,
    });
    return;
  } catch (error) {
    console.error("Error creating lecture:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create lecture.",
    });
    return;
  }
};

export const getCourseLecture = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId).populate("lectures")
    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found!"
      })
      return;
    }
    res.status(200).json({
      success: true,
      lectures: course.lectures
    })
  } catch (error) {
    console.error("Error creating lecture:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get course lecture.",
    });
    return;
  }
}

export const editLecture = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { lectureTitle, isPreviewFree } = req.body;
    const { courseId, lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      res.status(404).json({
        success: false,
        message: "Lecture not found!",
      });
      return;
    }

    if (req.file) {
      if (lecture.publicId) {
        await deleteVideoFromCloudinary(lecture.publicId);
      }

      const uploadResponse = await uploadMedia(req.file.path);
      if (uploadResponse) {
        lecture.videoUrl = uploadResponse.secure_url;
        lecture.publicId = uploadResponse.public_id;
      }
    }

    if (lectureTitle) lecture.lectureTitle = lectureTitle;
    if (isPreviewFree !== undefined) lecture.isPreviewFree = isPreviewFree;

    await lecture.save();
    const lectureIds: Types.ObjectId = lecture._id as Types.ObjectId;


    const course = await Course.findById(courseId);
    if (course && !course.lectures.includes(lectureIds)) {
      course.lectures.push(lectureIds);
      await course.save();
    }

    res.status(200).json({
      success: true,
      lecture,
      message: "Lecture updated successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to edit lecture",
    });
  }
};

export const removeLecture = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findByIdAndDelete(lectureId)
    if (!lecture) {
      res.status(404).json({
        success: false,
        messsage: "Lecture not found!"
      })
    }

    if (lecture?.publicId) {
      await deleteVideoFromCloudinary(lecture.publicId);
    }

    await Course.updateOne(
      { lectures: lectureId },
      { $pull: { lectures: lectureId } }
    )

    res.status(200).json({
      success: true,
      message: "Lecture removed successfully"
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Failed to remove lecture"
    })
  }
}

export const getLectureById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId)
    if (!lecture) {
      res.status(404).json({
        message: "Lecture not found!"
      });
      return;
    }
    res.status(200).json({
      lecture
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to get lecture by id"
    })
    return;
  }
}

export const togglePublicCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { publish } = req.query;
    const course = await Course.findById(courseId);

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found!",
      });
      return;
    }

    if (!course.courseLevel || !["Beginner", "Medium", "Advance"].includes(course.courseLevel)) {
      course.courseLevel = "Beginner"; // Set to default if undefined or invalid
    }

    course.isPublished = publish === "true";
    await course.save();

    const statusMessage = course.isPublished ? "Published" : "Unpublished";
    res.status(200).json({
      message: `Course is ${statusMessage}`,
    });
    console.log(statusMessage, "statusMessage")
    console.log(course, "course")
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to update status",
    });
    return;
  }
};

export const getPublishedCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const courses = await Course.find({ isPublished: true }).populate({ path: "creator", select: "name photoUrl" });
    if (!courses) {
      res.status(404).json({
        message: "Course not found"
      })
      return;
    }
    res.status(200).json({
      courses,
    })
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to get published courses"
    })
    return;
  }
}