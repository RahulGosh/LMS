import {
  CourseType,
  EditCoursePayload,
  SingleCourseDetail,
  UpdateCourseResponse,
} from "@/types/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const USER_API = `${import.meta.env.VITE_BACKEND_URL}/api/v1/`;

export interface Course {
  _id: string;
  courseTitle: string;
  subTitle?: string;
  description?: string;
  category: string;
  courseLevel?: "Beginner" | "Medium" | "Advance";
  coursePrice?: number;
  courseThumbnail?: string;
  enrolledStudents?: string[];
  lectures?: Lecture[]; // Updated to use the Lecture interface
  creator?: {
    name?: string;
    photoUrl?: string;
  };
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PublishedCoursesResponse {
  courses: Course[];
}

interface CreateLectureResponse {
  success: boolean;
  message: string;
  lecture: Lecture;
}

interface UpdateLectureResponse {
  success: boolean;
  message: string;
  lecture: Lecture;
}

export interface Lecture {
  _id: string;
  lectureTitle: string;
  videoUrl?: string;
  publicId?: string;
  isPreviewFree?: boolean;
}

export interface LectureResponse {
  lectures: Lecture[];
}

export interface RemoveLectureResponse {
  success: boolean;
  message: string;
}

export interface LectureDetailResponse {
  success: boolean;
  lecture: Lecture;
}

export const courseApi = createApi({
  reducerPath: "courseApi",
  tagTypes: ["REFETCH_Creator_Course"],
  baseQuery: fetchBaseQuery({
    baseUrl: USER_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createCourse: builder.mutation({
      query: ({
        courseTitle,
        category,
      }: {
        courseTitle: string;
        category: string;
      }) => ({
        url: "create-course",
        method: "POST",
        body: { courseTitle, category },
      }),
      invalidatesTags: [{ type: "REFETCH_Creator_Course" }],
    }),

    searchCourse: builder.query<PublishedCoursesResponse, { query: string; sortBy: string; categories: string }>({
      query: ({ query = "", sortBy = "createdAt", categories = "" }) => ({
        url: "search",
        method: "GET",
        params: { query, sortBy: sortBy || "createdAt", categories },
      }),
      providesTags: [{ type: "REFETCH_Creator_Course" }],
    }),

    getAllAdminCourses: builder.query<CourseType, void>({
      query: () => ({
        url: "courses",
        method: "GET",
      }),
      providesTags: [{ type: "REFETCH_Creator_Course" }],
    }),

    editCourse: builder.mutation<UpdateCourseResponse, EditCoursePayload>({
      query: ({ formData, courseId }) => ({
        url: `courses/${courseId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: [{ type: "REFETCH_Creator_Course" }],
    }),

    getCourseById: builder.query<SingleCourseDetail, string>({
      query: (courseId) => ({
        url: `getCourseById/${courseId}`,
        method: "GET",
      }),
      providesTags: [{ type: "REFETCH_Creator_Course" }],
    }),

    createLecture: builder.mutation<
      CreateLectureResponse,
      { lectureTitle: string; courseId: string }
    >({
      query: ({ lectureTitle, courseId }) => ({
        url: `create-lecture/${courseId}`,
        method: "POST",
        body: { lectureTitle },
      }),
      invalidatesTags: [{ type: "REFETCH_Creator_Course" }],
    }),

    getCourseLecture: builder.query<LectureResponse, string>({
      query: (courseId) => ({
        url: `getCourseLecture/${courseId}`,
        method: "GET",
      }),
      providesTags: [{ type: "REFETCH_Creator_Course" }],
    }),

    editLecture: builder.mutation<
      UpdateLectureResponse,
      { formData: FormData; courseId: string; lectureId: string }
    >({
      query: ({ formData, courseId, lectureId }) => ({
        url: `lectures/${courseId}/${lectureId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: [{ type: "REFETCH_Creator_Course" }],
    }),

    removeLecture: builder.mutation<
      RemoveLectureResponse,
      { lectureId: string }
    >({
      query: ({ lectureId }) => ({
        url: `remove-lecture/${lectureId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "REFETCH_Creator_Course" }],
    }),

    getLectureById: builder.query<LectureDetailResponse, { lectureId: string }>(
      {
        query: ({ lectureId }) => ({
          url: `getLectureById/${lectureId}`,
          method: "GET",
        }),
        providesTags: [{ type: "REFETCH_Creator_Course" }],
      }
    ),

    publishCourse: builder.mutation<
      { success: boolean; message: string },
      { courseId: string; query: boolean }
    >({
      query: ({ courseId, query }) => ({
        url: `publish-course/${courseId}?publish=${query}`,
        method: "PATCH",
        body: query,
      }),
      invalidatesTags: [{ type: "REFETCH_Creator_Course" }],
    }),

    getPublishedCourse: builder.query<CourseType, void>({
      query: () => ({
        url: `getPublishedCourse`,
        method: "GET",
      }),
      providesTags: [{ type: "REFETCH_Creator_Course" }],
    }),
  }),
});

export const {
  useCreateCourseMutation,
  useSearchCourseQuery,
  useGetAllAdminCoursesQuery,
  useEditCourseMutation,
  useGetCourseByIdQuery,
  useCreateLectureMutation,
  useGetCourseLectureQuery,
  useEditLectureMutation,
  useRemoveLectureMutation,
  useGetLectureByIdQuery,
  usePublishCourseMutation,
  useGetPublishedCourseQuery,
} = courseApi;
