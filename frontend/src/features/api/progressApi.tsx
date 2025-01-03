import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Course } from "./courseApi";

const USER_API = `${import.meta.env.VITE_BACKEND_URL}/api/v1/`;

export interface LectureProgressType {
  lectureId: string;
  viewed: boolean;
}

export interface CourseProgressType {
  userId: string;
  courseId: string;
  completed: boolean;
  lectureProgress: LectureProgressType[];
}

export interface GetCourseProgressResponse {
  data: {
    courseDetails: Course;
    progress: LectureProgressType[];
    completed: boolean;
  };
}

export interface UpdateLectureProgressResponse {
  success: boolean;
  message: string;
}

export interface MarkCourseResponse {
  success: boolean;
  message: string;
}

export const progressApi = createApi({
  reducerPath: "progressApi",
  tagTypes: ["REFETCH_Course_Progress"],
  baseQuery: fetchBaseQuery({
    baseUrl: USER_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getCourseProgress: builder.query<GetCourseProgressResponse, string>({
      query: (courseId) => ({
        url: `getCourseProgress/${courseId}`,
        method: "GET",
      }),
      providesTags: [{ type: "REFETCH_Course_Progress" }],
    }),

    updateLectureProgress: builder.mutation<
      UpdateLectureProgressResponse,
      { courseId: string; lectureId: string }
    >({
      query: ({ courseId, lectureId }) => ({
        url: `update/view/${courseId}/${lectureId}`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "REFETCH_Course_Progress" }],
    }),

    markAsCompleted: builder.mutation<MarkCourseResponse, { courseId: string }>(
      {
        query: ({ courseId }) => ({
          url: `markAsCompleted/${courseId}`,
          method: "POST",
        }),
        invalidatesTags: [{ type: "REFETCH_Course_Progress" }],
      }
    ),

    markAsInCompleted: builder.mutation<
      MarkCourseResponse,
      { courseId: string }
    >({
      query: ({ courseId }) => ({
        url: `markAsInCompleted/${courseId}`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "REFETCH_Course_Progress" }],
    }),
  }),
});

export const {
  useGetCourseProgressQuery,
  useUpdateLectureProgressMutation,
  useMarkAsCompletedMutation,
  useMarkAsInCompletedMutation,
} = progressApi;
