import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Course } from "./courseApi";

const USER_API = `${import.meta.env.VITE_BACKEND_URL}/api/v1/`;

export interface CoursePurchaseType {
    courseId: Course;
    userId: string;
    amount: number;
    status: string;
    paymentId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface GetAllPurchasedCoursesResponse {
  purchasedCourse: CoursePurchaseType[];
}

export interface CreateCheckoutSessionResponse {
  success: boolean;
  url?: string;
  message?: string;
  purchase?: CoursePurchaseType; // Add the CoursePurchaseType to the response
}

export interface CoursePurchaseDetailResponse {
  course: Course; // Updated to reflect a single course object instead of an array
  purchased: boolean;
}

export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  tagTypes: ["REFETCH_Course_Purchase"],
  baseQuery: fetchBaseQuery({
    baseUrl: USER_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation<
      CreateCheckoutSessionResponse,
      string
    >({
      query: (courseId) => ({
        url: "checkout/create-checkout-session",
        method: "POST",
        body: { courseId }, // Send the courseId as part of the body
      }),
    }),

    getCourseDetailWithStatus: builder.query<
      CoursePurchaseDetailResponse,
      string
    >({
      query: (courseId) => ({
        url: `detail-with-status/${courseId}`,
        method: "GET",
      }),
      providesTags: [{ type: "REFETCH_Course_Purchase" }],
    }),

    getAllPurchasedCourses: builder.query<GetAllPurchasedCoursesResponse, void>({
      query: () => ({
        url: "getAllPurchasedCourse",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useGetCourseDetailWithStatusQuery,
  useGetAllPurchasedCoursesQuery,
} = purchaseApi;
