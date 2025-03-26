import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BadgeInfo,
  Lock,
  PlayCircle,
  Bookmark,
  Book,
  Users,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Video,
  Loader2,
} from "lucide-react";
import ReactPlayer from "react-player";
import { useNavigate, useParams } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import {
  useEnrollFreeCourseMutation,
  useGetCourseDetailWithStatusQuery,
} from "@/features/api/purchaseApi";
import { Lecture, SubLecture, User } from "@/types/types";
import BuyCourseButton from "@/components/buyCourseButton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { RootState } from "@/app/store";
import { useSelector } from "react-redux";

const CourseDetail: React.FC = () => {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId || "";
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedLectureId, setExpandedLectureId] = useState<string | null>(
    null
  );

  const { user } = useSelector((store: RootState) => store.auth) as { user: User | null };

  const { data, isLoading, isError, refetch  } = useGetCourseDetailWithStatusQuery(
    courseId,
    {
      skip: !courseId,
    }
  );
  useEffect(() => {
    if (courseId) {
      refetch();
    }
  }, [user, courseId, refetch]);

  const [enrollFreeCourse, { isLoading: isEnrolling }] =
    useEnrollFreeCourseMutation();

  console.log(data, "lecture data");

  const handleEnrollCourse = async () => {
    try {
      const result = await enrollFreeCourse(courseId).unwrap();

      if (result.success) {
        toast.success("Successfully enrolled in the course!");
        navigate(`/course-progress/${courseId}`);
      } else {
        toast.error(result.message || "Failed to enroll in course");
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("Failed to enroll in course");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-500">
          Failed to load course details
        </h1>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const course = data?.course;
  const purchased = data?.purchased;

  const handleContinueCourse = () => {
    if (purchased) {
      navigate(`/course-progress/${courseId}`);
    }
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const toggleLecture = (lectureId: string) => {
    if (expandedLectureId === lectureId) {
      setExpandedLectureId(null);
    } else {
      setExpandedLectureId(lectureId);
    }
  };

  const formatHoursToHMM = (decimalHours: number | undefined): string => {
    if (decimalHours === undefined) return "0h 0m";

    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours % 1) * 60);

    // Handle 60-minute overflow case
    if (minutes === 60) {
      return `${hours + 1}h 0m`;
    }

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-gradient-to-b from-gray-100 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 flex flex-col gap-4">
          <Badge className="w-fit bg-gray-600 hover:bg-gray-700 mb-2">
            {course?.category || "Category"}
          </Badge>
          <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl leading-tight">
            {course?.courseTitle || "Course Title"}
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-3xl">
            {course?.subTitle || "Course Sub-title"}
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <img
                src={
                  course?.creator?.photoUrl || "https://github.com/shadcn.png"
                }
                alt="Creator"
                className="w-8 h-8 rounded-full object-cover"
              />
              <p className="font-medium">
                {course?.creator?.name || "Unknown Creator"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <BadgeInfo size={16} />
              <p>
                Updated{" "}
                {course?.createdAt
                  ? new Date(course.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} />
              <p>{course?.enrolledStudents?.length || 0} enrolled</p>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap size={16} />
              <p>{course?.courseLevel || "Beginner"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto my-8 px-4 md:px-8 flex flex-col lg:flex-row gap-10">
        {/* Left Side - Course Content */}
        <div className="w-full lg:w-2/3 space-y-8">
          {/* Tutorial Video Section */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="relative w-full aspect-video bg-black">
              <ReactPlayer
                width="100%"
                height="100%"
                url={course?.tutorial?.videoUrl || ""}
                controls={true}
                light={!isPlaying && course?.courseThumbnail}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                playIcon={
                  <Button
                    size="lg"
                    variant="default"
                    className="flex items-center gap-2"
                  >
                    <PlayCircle size={24} />
                    <span>Play Free Tutorial</span>
                  </Button>
                }
              />
              {!isPlaying && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Free Tutorial
                </div>
              )}
            </div>
          </Card>

          {/* Tabs for Course Content */}
          <Tabs defaultValue="tutorial" className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="tutorial">Tutorial</TabsTrigger>
              <TabsTrigger value="lectures">Course Content</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
            </TabsList>

            <TabsContent value="tutorial" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Bookmark className="text-blue-500" size={24} />
                  <h2 className="text-2xl font-bold">Free Tutorial</h2>
                </div>
                <div className="prose prose-blue max-w-none">
                  {course?.tutorial?.tutorialDescription ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: course.tutorial.tutorialDescription,
                      }}
                    />
                  ) : (
                    <p>No tutorial description available.</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lectures" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Book size={20} />
                    Course Content
                  </CardTitle>
                  <CardDescription>
                    <span className="font-medium">
                      {course?.lectures?.length || 0} sections •{" "}
                    </span>
                    <span className="font-medium">
                      {course?.lectures?.reduce(
                        (total, lecture) =>
                          total + (lecture.subLectures?.length || 0),
                        0
                      ) || 0}{" "}
                      lectures •{" "}
                    </span>
                    <span className="font-medium">
                      {formatHoursToHMM(course?.totalHours ?? 10)}
                      &nbsp;total length
                    </span>{" "}
                    •{" "}
                    <span className="font-medium">
                      {purchased ? "Full Access" : "Locked"}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {course?.lectures?.length ? (
                    course.lectures.map((lecture: Lecture, idx) => (
                      <Collapsible
                        key={lecture._id}
                        open={expandedLectureId === lecture._id}
                        onOpenChange={() => toggleLecture(lecture._id)}
                        className="border rounded-lg overflow-hidden"
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {purchased ? (
                                <div className="bg-green-100 p-2 rounded-full">
                                  <PlayCircle
                                    size={18}
                                    className="text-green-600"
                                  />
                                </div>
                              ) : (
                                <div className="bg-gray-100 p-2 rounded-full">
                                  <Lock size={18} className="text-gray-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-grow text-left">
                              <p className="font-medium">
                                {lecture.lectureTitle}
                              </p>
                              <p className="text-sm text-gray-500">
                                {/* {formatHoursToHMM(course.totalHours)} */}
                                {formatHoursToHMM(lecture.totalHours)}
                              </p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-gray-400">
                            {expandedLectureId === lecture._id ? (
                              <ChevronUp size={18} />
                            ) : (
                              <ChevronDown size={18} />
                            )}
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="bg-gray-100 border-t">
                          <div className="p-2">
                            {lecture.subLectures?.length ? (
                              lecture.subLectures.map(
                                (subLecture: SubLecture) => (
                                  <div
                                    key={subLecture._id}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-100 transition-colors rounded-md"
                                  >
                                    <div className="flex-shrink-0">
                                      {purchased ? (
                                        <Video
                                          size={18}
                                          className="text-green-600"
                                        />
                                      ) : (
                                        <Lock
                                          size={18}
                                          className="text-gray-600"
                                        />
                                      )}
                                    </div>
                                    <div className="flex-grow">
                                      <p className="text-sm font-medium">
                                        {subLecture.subLectureTitle}
                                      </p>
                                    </div>
                                    <div className="flex-shrink-0 text-sm text-gray-500">
                                      {subLecture.duration.hours > 0 &&
                                        `${subLecture.duration.hours} hr `}
                                      {subLecture.duration.minutes > 0 &&
                                        `${subLecture.duration.minutes} min`}
                                      {subLecture.duration.hours === 0 &&
                                        subLecture.duration.minutes === 0 &&
                                        "0 min"}
                                    </div>
                                  </div>
                                )
                              )
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-sm text-gray-500">
                                  No videos available for this lecture.
                                </p>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p>No lectures available for this course.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="description" className="space-y-6">
              <div className="prose prose-blue max-w-none">
                <h2 className="text-2xl font-bold mb-4">About This Course</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: course?.description || "",
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side - Purchase Card */}
        <div className="w-full lg:w-1/3 lg:sticky lg:top-8 self-start">
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className="relative">
              <img
                src={course?.courseThumbnail || "/api/placeholder/400/200"}
                alt="Course thumbnail"
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <h2 className="text-white font-bold text-lg">
                  {course?.courseTitle || "Course Title"}
                </h2>
              </div>
            </div>
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">
                  {course?.coursePrice
                    ? `$${course.coursePrice.toFixed(2)}`
                    : "Free"}
                </h1>
                {purchased && (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-600 border-green-200"
                  >
                    Purchased
                  </Badge>
                )}
              </div>

              <div className="space-y-4 mt-4">
                <h3 className="font-semibold">This course includes:</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <PlayCircle size={20} className="text-blue-500" />
                    <span>Full lifetime access</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Book size={20} className="text-blue-500" />
                    <span>{course?.lectures?.length || 0} lectures</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <GraduationCap size={20} className="text-blue-500" />
                    <span>{course?.courseLevel || "Beginner"} level</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center p-6 pt-0">
              {purchased ? (
                <Button
                  onClick={handleContinueCourse}
                  className="w-full py-6 text-lg bg-blue-700 hover:bg-blue-800 transition-colors"
                >
                  Continue Learning
                </Button>
              ) : course?.isFree ? (
                <Button
                  onClick={handleEnrollCourse}
                  className="w-full py-6 text-lg bg-green-600 hover:bg-green-700 transition-colors"
                  disabled={isEnrolling}
                >
                  {isEnrolling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    "Enroll this Course"
                  )}
                </Button>
              ) : (
                <div className="w-full">
                  <BuyCourseButton courseId={courseId} />
                  <p className="text-center mt-4 text-sm text-gray-500">
                    30-day money-back guarantee
                  </p>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
