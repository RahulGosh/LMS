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
  useRemoveCourseMutation,
} from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import RichTextEditor, { CourseInputState } from "@/components/richTextEditor";
import { toast } from "sonner";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import TutorialDescriptionEditor from "@/components/tutorialDescriptionEditor";
import { Switch } from "@/components/ui/switch";

const CourseTab = () => {
  const [input, setInput] = useState<CourseInputState>({
    courseTitle: "",
    isFree: false,
    subTitle: "",
    description: "",
    category: "",
    courseLevel: "",
    coursePrice: "",
    courseThumbnail: "",
    tutorialDescription: "",
  });

  const [errors, setErrors] = useState({
    courseTitle: "",
    subTitle: "",
    description: "",
    category: "",
    courseLevel: "",
    coursePrice: "",
    tutorialDescription: "",
    courseThumbnail: "",
    tutorialVideo: ""
  });

  const params = useParams();
  const courseId = params.courseId || "";
  const [editCourse, { data, isLoading, isSuccess, error }] =
    useEditCourseMutation();
  const [removeCourse, { isLoading: isRemoving }] = useRemoveCourseMutation();
  const {
    data: courseData,
    isLoading: courseIsLoading,
    isSuccess: courseIsSuccess,
  } = useGetCourseByIdQuery(courseId, { skip: !courseId });
  const [publishCourse] = usePublishCourseMutation();

  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>("");
  const [previewTutorialVideo, setPreviewTutorialVideo] = useState<string | null>(null);
  const [tutorialVideo, setTutorialVideo] = useState<File | null>(null);
  const [hasExistingTutorialVideo, setHasExistingTutorialVideo] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (courseIsSuccess && courseData?.course) {
      const course = courseData.course;
      setInput({
        courseTitle: course.courseTitle || "",
        isFree: course.isFree || false,
        subTitle: course.subTitle || "",
        description: course.description || "",
        category: course.category || "",
        courseLevel: course.courseLevel || "",
        coursePrice: course.coursePrice?.toString() || "",
        courseThumbnail: course.courseThumbnail || "",
        tutorialDescription: course.tutorial?.tutorialDescription || "",
      });

      if (course.courseThumbnail) {
        setPreviewThumbnail(course.courseThumbnail);
      }

      if (course.tutorial?.videoUrl) {
        setPreviewTutorialVideo(course.tutorial.videoUrl);
        setHasExistingTutorialVideo(true);
      }
    }
  }, [courseIsSuccess, courseData]);

  const validateForm = () => {
    const newErrors = {
      courseTitle: !input.courseTitle.trim() ? "Course title is required" : "",
      subTitle: !input.subTitle.trim() ? "Subtitle is required" : "",
      description: !input.description.trim() ? "Description is required" : "",
      category: !input.category ? "Category is required" : "",
      courseLevel: !input.courseLevel ? "Course level is required" : "",
      coursePrice: !input.isFree && !input.coursePrice ? "Price is required for paid courses" : "",
      tutorialDescription: !input.tutorialDescription.trim() ? "Tutorial description is required" : "",
      courseThumbnail: !input.courseThumbnail ? "Thumbnail is required" : "",
      tutorialVideo: !previewTutorialVideo && !hasExistingTutorialVideo ? "Tutorial video is required" : ""
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const changeEventHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const selectCategory = (value: string) => {
    setInput(prev => ({ ...prev, category: value }));
    setErrors(prev => ({ ...prev, category: "" }));
  };

  const selectCourseLevel = (value: string) => {
    setInput(prev => ({ ...prev, courseLevel: value }));
    setErrors(prev => ({ ...prev, courseLevel: "" }));
  };

  const selectThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput(prev => ({ ...prev, courseThumbnail: file }));
      const fileReader = new FileReader();
      fileReader.onloadend = () => setPreviewThumbnail(fileReader.result as string);
      fileReader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, courseThumbnail: "" }));
    }
  };

  const selectTutorialVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTutorialVideo(file);
      const videoUrl = URL.createObjectURL(file);
      setPreviewTutorialVideo(videoUrl);
      setErrors(prev => ({ ...prev, tutorialVideo: "" }));
    }
  };

  const updateCourseHandler = async () => {
    if (!courseId) return;
    
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("courseTitle", input.courseTitle);
    formData.append("isFree", input.isFree.toString());
    formData.append("subTitle", input.subTitle);
    formData.append("description", input.description);
    formData.append("category", input.category);
    formData.append("courseLevel", input.courseLevel);
    
    if (!input.isFree) {
      formData.append("coursePrice", input.coursePrice);
    }

    if (input.courseThumbnail instanceof File) {
      formData.append("courseThumbnail", input.courseThumbnail);
    }

    if (tutorialVideo) {
      formData.append("tutorialVideo", tutorialVideo);
    }

    formData.append("tutorialDescription", input.tutorialDescription);

    await editCourse({ formData, courseId });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Course updated successfully");
      navigate("/admin/courses");
    }

    if (error) {
      const errorData = (error as FetchBaseQueryError)?.data as { message?: string };
      toast.error(errorData?.message || "Failed to update course");
    }
  }, [isSuccess, error, data, navigate]);

  const publishStatusHandler = async (publish: boolean) => {
    if (!courseId) return;

    try {
      const response = await publishCourse({ courseId, query: publish }).unwrap();
      toast.success(response.message || "Course status updated!");
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const handleTutorialDescriptionChange = (value: string) => {
    setInput(prev => ({ ...prev, tutorialDescription: value }));
    setErrors(prev => ({ ...prev, tutorialDescription: "" }));
  };

  const handleRemoveCourse = async () => {
    if (!courseId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      const response = await removeCourse({ courseId }).unwrap();
      toast.success(response.message || "Course deleted successfully");
      navigate("/admin/courses");
    } catch (error) {
      const errorData = (error as FetchBaseQueryError)?.data as { message?: string };
      toast.error(errorData?.message || "Failed to delete course");
    }
  };

  if (courseIsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading course data...</span>
      </div>
    );
  }

  return (
    <Card className="bg-[#F3F4F6] shadow-lg border border-gray-300">
      <CardHeader className="flex flex-row justify-between items-center bg-gradient-to-r from-[#1F2937] to-[#374151] p-6 rounded-t-lg">
        <div>
          <CardTitle className="text-white text-2xl font-bold">
            Basic Course Information
          </CardTitle>
          <CardDescription className="text-blue-200">
            Make changes to your courses here. Click save when you're done.
          </CardDescription>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            className="bg-white hover:bg-gray-100 text-blue-800"
            onClick={() => publishStatusHandler(!courseData?.course?.isPublished)}
          >
            {courseData?.course?.isPublished ? "Unpublish" : "Publish"}
          </Button>
          <Button
            variant="destructive"
            className="hover:bg-red-700"
            onClick={handleRemoveCourse}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Remove Course"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6">
          <div>
            <Label className="text-gray-700 font-semibold">
              Tutorial Video *
            </Label>
            <Input
              type="file"
              accept="video/*"
              onChange={selectTutorialVideo}
              className={`mt-2 ${errors.tutorialVideo ? "border-red-500" : ""}`}
            />
            {previewTutorialVideo && (
              <video
                src={previewTutorialVideo}
                controls
                className="w-full max-w-md mt-2 rounded-lg shadow-md"
              />
            )}
            {errors.tutorialVideo && (
              <p className="text-red-500 text-sm mt-1">{errors.tutorialVideo}</p>
            )}
          </div>

          <div>
            <Label className="text-gray-700 font-semibold">
              Tutorial Description *
            </Label>
            <TutorialDescriptionEditor
              value={input.tutorialDescription}
              onChange={handleTutorialDescriptionChange}
            />
            {errors.tutorialDescription && (
              <p className="text-red-500 text-sm mt-1">{errors.tutorialDescription}</p>
            )}
          </div>

          <div className="space-y-4 mt-5">
            <div>
              <Label className="text-gray-700 font-semibold">Title *</Label>
              <Input
                type="text"
                name="courseTitle"
                value={input.courseTitle}
                onChange={changeEventHandler}
                placeholder="Ex. Fullstack developer"
                className={`mt-2 ${errors.courseTitle ? "border-red-500" : ""}`}
              />
              {errors.courseTitle && (
                <p className="text-red-500 text-sm mt-1">{errors.courseTitle}</p>
              )}
            </div>

            <div>
              <Label className="text-gray-700 font-semibold">Subtitle *</Label>
              <Input
                type="text"
                name="subTitle"
                value={input.subTitle}
                onChange={changeEventHandler}
                placeholder="Ex. Become a Fullstack developer from zero to hero in 2 months"
                className={`mt-2 ${errors.subTitle ? "border-red-500" : ""}`}
              />
              {errors.subTitle && (
                <p className="text-red-500 text-sm mt-1">{errors.subTitle}</p>
              )}
            </div>

            <div>
              <Label className="text-gray-700 font-semibold">Description *</Label>
              <RichTextEditor input={input} setInput={setInput} />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <div>
                <Label className="text-gray-700 font-semibold">Category *</Label>
                <Select 
                  value={input.category} 
                  onValueChange={selectCategory}
                >
                  <SelectTrigger className={`w-[180px] mt-2 ${errors.category ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Category</SelectLabel>
                      <SelectItem value="NextJS">NextJS</SelectItem>
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
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>

              <div>
                <Label className="text-gray-700 font-semibold">
                  Course Level *
                </Label>
                <Select
                  value={input.courseLevel}
                  onValueChange={selectCourseLevel}
                >
                  <SelectTrigger className={`w-[180px] mt-2 ${errors.courseLevel ? "border-red-500" : ""}`}>
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
                {errors.courseLevel && (
                  <p className="text-red-500 text-sm mt-1">{errors.courseLevel}</p>
                )}
              </div>

              <div className="flex items-center gap-5">
                {!input.isFree && (
                  <div className="w-[180px]">
                    <Label className="text-gray-700 font-semibold">
                      Price in (INR) *
                    </Label>
                    <Input
                      type="number"
                      name="coursePrice"
                      value={input.coursePrice}
                      onChange={changeEventHandler}
                      placeholder="199"
                      className={`w-full mt-2 ${errors.coursePrice ? "border-red-500" : ""}`}
                    />
                    {errors.coursePrice && (
                      <p className="text-red-500 text-sm mt-1">{errors.coursePrice}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-2 h-[72px]">
                  <Switch
                    checked={input.isFree}
                    onCheckedChange={(value) => {
                      setInput(prev => ({
                        ...prev,
                        isFree: value,
                        coursePrice: value ? "" : prev.coursePrice,
                      }));
                      setErrors(prev => ({ ...prev, coursePrice: "" }));
                    }}
                    id="is-free"
                  />
                  <Label htmlFor="is-free" className="font-medium">
                    Free Course
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-gray-700 font-semibold">
                Course Thumbnail *
              </Label>
              <Input
                type="file"
                onChange={selectThumbnail}
                accept="image/*"
                className={`w-fit mt-2 ${errors.courseThumbnail ? "border-red-500" : ""}`}
              />
              {previewThumbnail && (
                <img
                  src={previewThumbnail}
                  className="h-64 w-auto my-2 object-contain rounded-lg shadow-md"
                  alt="Course Thumbnail"
                />
              )}
              {errors.courseThumbnail && (
                <p className="text-red-500 text-sm mt-1">{errors.courseThumbnail}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => navigate("/admin/courses")}
                variant="outline"
                className="bg-white hover:bg-gray-100 text-blue-800"
              >
                Cancel
              </Button>
              <Button
                onClick={updateCourseHandler}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseTab;