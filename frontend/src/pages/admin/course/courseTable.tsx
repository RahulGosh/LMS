import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetAllAdminCoursesQuery } from "@/features/api/courseApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, PlusCircle } from "lucide-react";

const CourseTable: React.FC = () => {
  const { data, isLoading } = useGetAllAdminCoursesQuery();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const courses = data?.courses ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8">
      {/* Header Section */}
      <div className="flex justify-between items-center py-6">
        <h1 className="text-2xl font-bold text-gray-800">Courses</h1>
        <Button
          onClick={() => navigate("create")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          <PlusCircle size={18} />
          Create a New Course
        </Button>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden border rounded-lg shadow-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="py-4 px-6 text-left">Title</th>
              <th className="py-4 px-6 text-left">Price</th>
              <th className="py-4 px-6 text-left">Status</th>
              <th className="py-4 px-6 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {courses.length > 0 ? (
              courses.map((course) => (
                <tr
                  key={course._id}
                  className="hover:bg-gray-50 transition-colors border-t"
                >
                  <td className="py-4 px-6 text-gray-800 font-medium">
                    {course.courseTitle}
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {course.isFree ? "Free" : course.coursePrice || "NA"} 
                    {/* {course.coursePrice ? `$${course.coursePrice}` : "NA"} */}
                  </td>
                  <td className="py-4 px-6">
                    <Badge
                      className={`${
                        course.isPublished
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <Button
                      onClick={() => navigate(course._id)}
                      className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-3 py-1.5 rounded-lg"
                    >
                      <Edit size={16} />
                      Edit
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="py-6 text-center text-gray-500 italic"
                >
                  No courses available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseTable;
