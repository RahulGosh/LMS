import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useEditCourseMutation,
  useGetCourseByIdQuery,
  usePublishCourseMutation,
} from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import RichTextEditor, { CourseInputState } from "@/components/richTextEditor"; // Update the import to use CourseInputState
import { toast } from "sonner";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const CourseTab = () => {
  const [input, setInput] = useState<CourseInputState>({
    courseTitle: "",
    subTitle: "",
    description: "",
    category: "",
    courseLevel: "",
    coursePrice: "",
    courseThumbnail: "",
  });

  const params = useParams();
  const courseId = params.courseId || "";
  const [editCourse, { data, isLoading, isSuccess, error }] =
    useEditCourseMutation();
  const {
    data: courseData,
    isLoading: courseIsLoading,
    isSuccess: courseIsSuccess,
  } = useGetCourseByIdQuery(courseId, { skip: !courseId });
  const [publishCourse] = usePublishCourseMutation();

  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>("");
  const navigate = useNavigate();
  const course = courseData?.course;

  useEffect(() => {
    if (courseIsSuccess && courseData?.course) {
      const course = courseData.course;
      setInput({
        courseTitle: course.courseTitle,
        subTitle: course.subTitle || "",
        description: course.description || "",
        category: course.category,
        courseLevel: course.courseLevel || "",
        coursePrice: course.coursePrice?.toString() || "",
        courseThumbnail: course.courseThumbnail || "",
      });

      if (course.courseThumbnail) {
        setPreviewThumbnail(course.courseThumbnail);
      }
    }
  }, [courseIsSuccess, course]);

  const changeEventHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const selectCategory = (value: string) => {
    setInput({ ...input, category: value });
  };

  const selectCourseLevel = (value: string) => {
    setInput({ ...input, courseLevel: value });
  };

  const selectThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput({ ...input, courseThumbnail: file });
      const fileReader = new FileReader();
      fileReader.onloadend = () =>
        setPreviewThumbnail(fileReader.result as string);
      fileReader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "");
      navigate("/admin/courses");
    }

    if (error) {
      const errorData = (error as FetchBaseQueryError)?.data as {
        message?: string;
      };
      toast.error(errorData?.message || "Failed to create course");
    }
  }, [isSuccess, error, data, navigate]);

  const updateCourseHandler = async () => {
    if (!courseId) return;

    const formData = new FormData();
    formData.append("courseTitle", input.courseTitle);
    formData.append("subTitle", input.subTitle);
    formData.append("description", input.description);
    formData.append("category", input.category);
    formData.append("courseLevel", input.courseLevel);
    formData.append("coursePrice", input.coursePrice);
    formData.append("courseThumbnail", input.courseThumbnail);

    await editCourse({ formData, courseId });
  };

  if (courseIsLoading) return <h1>Loading...</h1>;

  const publishStatusHandler = async (publish: boolean) => {
    if (!courseId) return;

    try {
      const response = await publishCourse({
        courseId,
        query: publish,
      }).unwrap();

      toast.success(response.message || "Course status updated!");
    } catch (error) {
      // const errorData = (error as FetchBaseQueryError)?.data as {
      //   message?: string;
      // };
      console.error("Error occurred:", error); // Log the entire error

      // toast.error(errorData?.message || "Failed to update course status");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle>Basic Course Information</CardTitle>
          <CardDescription>
            Make changes to your courses here. Click save when you're done.
          </CardDescription>
        </div>
        <div className="space-x-2">
          <Button
            // disabled={course?.lectures?.length === 0}
            variant="outline"
            onClick={() => publishStatusHandler(!course?.isPublished)}
          >
            {course?.isPublished ? "Unpublished" : "Publish"}
          </Button>
          <Button>Remove Course</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-5">
          <div>
            <Label>Title</Label>
            <Input
              type="text"
              name="courseTitle"
              value={input.courseTitle}
              onChange={changeEventHandler}
              placeholder="Ex. Fullstack developer"
            />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input
              type="text"
              name="subTitle"
              value={input.subTitle}
              onChange={changeEventHandler}
              placeholder="Ex. Become a Fullstack developer from zero to hero in 2 months"
            />
          </div>
          <div>
            <Label>Description</Label>
            <RichTextEditor input={input} setInput={setInput} />
          </div>
          <div className="flex items-center gap-5">
            <div>
              <Label>Category</Label>
              <Select
                defaultValue={input.category}
                onValueChange={selectCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Category</SelectLabel>
                    <SelectItem value="Next JS">Next JS</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Frontend Development">
                      Frontend Development
                    </SelectItem>
                    <SelectItem value="Fullstack Development">
                      Fullstack Development
                    </SelectItem>
                    <SelectItem value="MERN Stack Development">
                      MERN Stack Development
                    </SelectItem>
                    <SelectItem value="Javascript">Javascript</SelectItem>
                    <SelectItem value="Python">Python</SelectItem>
                    <SelectItem value="Docker">Docker</SelectItem>
                    <SelectItem value="MongoDB">MongoDB</SelectItem>
                    <SelectItem value="HTML">HTML</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Course Level</Label>
              <Select
                defaultValue={input.courseLevel}
                onValueChange={selectCourseLevel}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a course level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Course Level</SelectLabel>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Advance">Advance</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Price in (INR)</Label>
              <Input
                type="number"
                name="coursePrice"
                value={input.coursePrice}
                onChange={changeEventHandler}
                placeholder="199"
                className="w-fit"
              />
            </div>
          </div>
          <div>
            <Label>Course Thumbnail</Label>
            <Input
              type="file"
              onChange={selectThumbnail}
              accept="image/*"
              className="w-fit"
            />
            {previewThumbnail && (
              <img
                src={previewThumbnail}
                className="e-64 my-2"
                alt="Course Thumbnail"
              />
            )}
          </div>
          <div>
            <Button
              onClick={() => navigate("/admin/courses")}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={updateCourseHandler}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseTab;
