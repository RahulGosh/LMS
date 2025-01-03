export type Register = {
  name: string;
  email: string;
  password: string;
}

export type Login = {
  email: string;
  password: string;
}


export interface User {
  _id: string;
  name: string;
  email: string;
  role: "instructor" | "student";
  photoUrl?: string;
  enrolledCourses: { _id: string; name: string }[];
}

export interface ProfileData {
  _id: string;
  name: string;
  email: string;
  role: "instructor" | "student";
  photoUrl?: string;
  enrolledCourses: { _id: string; name: string }[];
  message?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
  data: {
    message: string;
  };
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface AuthError {
  success: false;
  message: string;
}

export type UpdateUserResponse = {
  success: boolean;
  message: string; // Include `message` if the response contains it.
  user?: User;
};

// Course Types

export interface Course {
  _id: string;
  courseTitle: string;
  subTitle?: string;
  description?: string;
  category: string;
  courseLevel?: "Beginner" | "Medium" | "Advance";
  coursePrice?: number;
  courseThumbnail?: string;
  enrolledStudents?: string[]; // Assuming user IDs are strings
  lectures?: Lecture[]; // Assuming lecture IDs are strings
  creator?: {
    name?: string;
    photoUrl?: string;
  }; // Updated to include nested creator properties
  isPublished?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourseType {
  courses: Course[]; // Array of `Course` objects
}

export interface SingleCourseDetail {
  course: {
    _id: string;
    courseTitle: string;
    subTitle?: string;
    description?: string;
    category: string;
    courseLevel?: string;
    coursePrice?: number;
    courseThumbnail?: string;
    enrolledStudents?: string[]; // Assuming user IDs are strings
    lectures?: string[]; // Assuming lecture IDs are strings
    creator?: {
      name?: string;
      photoUrl?: string;
    }; // Updated to include nested creator properties
    isPublished?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }
}

export type UpdateCourseResponse = {
  success: boolean;
  message: string; // Include `message` if the response contains it.
  course?: Course;
};

export type EditCoursePayload = {
  formData: FormData; // The form data to be sent in the request
  courseId: string;
}

export type Lecture = {
  _id?: string;
  lectureTitle?: string;
  videoUrl?: string;
  publicId?: string;
  isPreviewFree?: boolean;
}

export interface LectureType {
  lectures?: LectureType
}