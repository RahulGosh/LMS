import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetAllAdminCoursesQuery } from "@/features/api/courseApi";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

const CourseTable: React.FC = () => {
  const { data, isLoading } = useGetAllAdminCoursesQuery();
  const navigate = useNavigate();

  if (isLoading) return <h1>Loading.....</h1>;

  const courses = data?.courses ?? [];

  return (
    <div>
      <Button onClick={() => navigate("create")}>Create a new course</Button>
      <Table>
        <TableCaption>A list of your recent courses.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.length > 0 ? (
            courses.map((course) => (
              <TableRow key={course._id}>
                <TableCell className="font-medium">
                  {course.coursePrice ? `$${course.coursePrice}` : "NA"}
                </TableCell>
                <TableCell>
                  <Badge>{course.isPublished ? "Published" : "Draft"}</Badge>
                </TableCell>
                <TableCell>{course.courseTitle}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(course._id)}
                  >
                    <Edit />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No courses available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CourseTable;
