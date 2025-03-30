import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  useCreateLectureMutation,
  useCreateSubLectureMutation,
  useGetCourseLectureQuery,
  useRemoveSubLectureMutation,
  useGetLectureByIdQuery,
  useEditSubLectureMutation,
} from "@/features/api/courseApi";
import { Loader2, PlusCircle, ChevronDown, Trash2, Pencil } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const CreateLecture = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [subLectureTitle, setSubLectureTitle] = useState("");
  const [durationHours, setDurationHours] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [currentLectureId, setCurrentLectureId] = useState<string | null>(null);
  const [currentSubLectureId, setCurrentSubLectureId] = useState<string | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [openLectureIndex, setOpenLectureIndex] = useState<number | null>(null);

  const params = useParams();
  const navigate = useNavigate();
  const courseId = params.courseId || "";

  const [createLecture, { data, isLoading, isSuccess, error }] = useCreateLectureMutation();
  const [createSubLecture, { isLoading: isSubLectureLoading }] = useCreateSubLectureMutation();
  const [editSubLecture, { isLoading: isUpdateSubLectureLoading }] = useEditSubLectureMutation();
  const { data: lectureData, isLoading: lectureLoading, refetch } = useGetCourseLectureQuery(courseId);
  const [removeSubLecture, { isLoading: isRemoving }] = useRemoveSubLectureMutation();

  const handleRemoveSubLecture = async (lectureId: string, subLectureId: string) => {
    try {
      await removeSubLecture({ lectureId, subLectureId }).unwrap();
      toast.success("Sub-Lecture deleted successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to delete sub-lecture");
    }
  };

  const createLectureHandler = async () => {
    if (!lectureTitle) {
      toast.error("Lecture title is required");
      return;
    }
    if (!courseId) {
      toast.error("Course ID is missing");
      return;
    }

    const result = await createLecture({ lectureTitle, courseId });

    if ("data" in result) {
      toast.success("Lecture created successfully!");
      setLectureTitle("");
      refetch();
    }
  };

  const createSubLectureHandler = async () => {
    if (!subLectureTitle || !currentLectureId || !videoFile) {
      toast.error("Title and video are required");
      return;
    }

    const formData = new FormData();
    formData.append("subLectureTitle", subLectureTitle);
    formData.append("hours", durationHours.toString());
    formData.append("minutes", durationMinutes.toString());
    formData.append("videoFile", videoFile);

    try {
      const result = await createSubLecture({
        formData,
        subLectureTitle,
        hours: durationHours,
        minutes: durationMinutes,
        lectureId: currentLectureId,
      });

      if ("data" in result) {
        toast.success("Sub-Lecture created successfully!");
        setSubLectureTitle("");
        setDurationHours(0);
        setDurationMinutes(0);
        setVideoFile(null);
        setOpenDialog(false);
        refetch();
      }
    } catch (error) {
      toast.error("Failed to create sub-lecture.");
    }
  };

  const updateSubLectureHandler = async () => {
    if (!subLectureTitle || !currentLectureId || !currentSubLectureId) {
      toast.error("Title is required");
      return;
    }

    const formData = new FormData();
    formData.append("subLectureTitle", subLectureTitle);
    formData.append("hours", durationHours.toString());
    formData.append("minutes", durationMinutes.toString());

    if (videoFile) {
      formData.append("videoFile", videoFile);
    }

    try {
      const result = await editSubLecture({
        formData,
        lectureId: currentLectureId,
        subLectureId: currentSubLectureId,
        hours: durationHours,
        minutes: durationMinutes,
      });

      if ("data" in result) {
        toast.success("Sub-Lecture updated successfully!");
        setSubLectureTitle("");
        setDurationHours(0);
        setDurationMinutes(0);
        setVideoFile(null);
        setCurrentVideoUrl(null);
        setOpenUpdateDialog(false);
        refetch();
      }
    } catch (error) {
      toast.error("Failed to update sub-lecture.");
    }
  };

  const handleOpenSubLectureDialog = (lectureId: string) => {
    setCurrentLectureId(lectureId);
    setOpenDialog(true);
  };

  const handleOpenUpdateSubLectureDialog = (lectureId: string, subLecture: any) => {
    setCurrentLectureId(lectureId);
    setCurrentSubLectureId(subLecture._id);
    setSubLectureTitle(subLecture.subLectureTitle);
    setDurationHours(subLecture.duration?.hours || 0);
    setDurationMinutes(subLecture.duration?.minutes || 0);
    setCurrentVideoUrl(subLecture.videoUrl);
    setVideoFile(null);
    setOpenUpdateDialog(true);
  };

  const handleCloseUpdateDialog = () => {
    setOpenUpdateDialog(false);
    setSubLectureTitle("");
    setDurationHours(0);
    setDurationMinutes(0);
    setVideoFile(null);
    setCurrentVideoUrl(null);
    setCurrentSubLectureId(null);
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setVideoFile(file);
    if (file) {
      setCurrentVideoUrl(URL.createObjectURL(file));
    } else {
      setCurrentVideoUrl(null);
    }
  };

  const handleGoToEditLectureHandler = (courseId: string, lectureId: string) => {
    navigate(`/admin/courses/${courseId}/lecture/${lectureId}`);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Lecture created successfully!");
      setLectureTitle("");
    }

    if (error) {
      toast.error("Failed to create lecture");
    }
  }, [isSuccess, error, data]);

  if (lectureLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="mt-2">Loading course data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full p-2 sm:p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Heading */}
        <div className="mb-4 sm:mb-6 text-center">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
            Create a New Lecture
          </h1>
          <p className="text-xs sm:text-base text-gray-500">
            Add details for your new lecture and optional sub-lectures.
          </p>
        </div>

        {/* Lecture Form */}
        <div className="space-y-3 sm:space-y-4 bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <div>
            <Label className="text-xs sm:text-base">Lecture Title</Label>
            <Input
              type="text"
              value={lectureTitle}
              onChange={(e) => setLectureTitle(e.target.value)}
              placeholder="Enter Lecture Title"
              className="w-full text-sm sm:text-base"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-4 sm:mt-6">
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/courses/${courseId}`)}
              className="w-full sm:w-auto bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm sm:text-base"
            >
              Back to Course
            </Button>
            <Button
              disabled={isLoading}
              onClick={createLectureHandler}
              className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                "Create Lecture"
              )}
            </Button>
          </div>
        </div>

        {/* Display Lectures */}
        <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
          {lectureData?.lectures?.map((lecture, index) => (
            <Collapsible
              key={lecture._id}
              className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
            >
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CollapsibleTrigger
                  onClick={() =>
                    setOpenLectureIndex(openLectureIndex === index ? null : index)
                  }
                  className="flex w-full justify-between items-center p-3 sm:p-4 hover:bg-blue-100 transition-colors duration-200"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold flex-shrink-0 text-xs sm:text-base">
                      {index + 1}
                    </div>
                    <span className="font-medium text-xs sm:text-base text-gray-800 truncate">
                      {lecture.lectureTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGoToEditLectureHandler(courseId, lecture._id);
                      }}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 sm:p-2"
                    >
                      <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSubLectureDialog(lecture._id);
                      }}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1 sm:p-2"
                    >
                      <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="sr-only sm:not-sr-only sm:ml-1 text-xs">Add</span>
                    </Button>
                    <ChevronDown
                      className={`w-4 h-4 sm:w-5 sm:h-5 text-blue-700 transition-transform duration-300 flex-shrink-0 ${
                        openLectureIndex === index ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3">
                  {lecture.subLectures?.length > 0 ? (
                    <div className="space-y-1 sm:space-y-2 py-1 sm:py-2">
                      {lecture.subLectures.map((subLecture, subIndex) => (
                        <div
                          key={subLecture._id}
                          className="p-2 sm:p-3 bg-white rounded-md shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-xs sm:text-sm flex-shrink-0">
                              {subIndex + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-xs sm:text-base truncate">
                                {subLecture.subLectureTitle}
                              </p>
                              <p className="text-xs text-gray-500">
                                {subLecture.duration?.hours || 0}h{" "}
                                {subLecture.duration?.minutes || 0}m
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 text-xs sm:text-sm"
                              onClick={() =>
                                handleOpenUpdateSubLectureDialog(
                                  lecture._id,
                                  subLecture
                                )
                              }
                            >
                              <span className="hidden sm:inline">Update</span>
                              <Pencil className="sm:hidden w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 sm:p-2"
                              onClick={() =>
                                handleRemoveSubLecture(
                                  lecture._id,
                                  subLecture._id
                                )
                              }
                              disabled={isRemoving}
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-3 sm:py-5 text-center">
                      <p className="text-xs sm:text-sm text-gray-500">No sub-lectures available</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenSubLectureDialog(lecture._id)}
                        className="mt-1 sm:mt-2 text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
                      >
                        <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> 
                        <span>Add sub-lecture</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}

          {lectureData?.lectures?.length === 0 && (
            <div className="text-center py-6 sm:py-10 bg-white rounded-lg border border-dashed border-gray-300 shadow-sm">
              <p className="text-xs sm:text-sm text-gray-500">
                No lectures available. Create your first lecture above.
              </p>
            </div>
          )}
        </div>

        {/* Create Sub-Lecture Dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle>Create Sub-Lecture</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Sub-Lecture Title</Label>
                <Input
                  type="text"
                  placeholder="Sub-Lecture Title"
                  value={subLectureTitle}
                  onChange={(e) => setSubLectureTitle(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hours</Label>
                  <Input
                    type="number"
                    placeholder="Hours"
                    min="0"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label>Minutes</Label>
                  <Input
                    type="number"
                    placeholder="Minutes"
                    min="0"
                    max="59"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {currentVideoUrl && (
                <div className="space-y-2">
                  <Label>Video Preview</Label>
                  <div className="border rounded-md p-1 bg-gray-50">
                    <video
                      src={currentVideoUrl}
                      controls
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Upload Video</Label>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className="w-full"
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpenDialog(false);
                  setSubLectureTitle("");
                  setDurationHours(0);
                  setDurationMinutes(0);
                  setVideoFile(null);
                  setCurrentVideoUrl(null);
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                disabled={isSubLectureLoading}
                onClick={createSubLectureHandler}
                className="w-full sm:w-auto"
              >
                {isSubLectureLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Sub-Lecture"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Sub-Lecture Dialog */}
        <Dialog
          open={openUpdateDialog}
          onOpenChange={(open) => {
            if (!open) handleCloseUpdateDialog();
            else setOpenUpdateDialog(open);
          }}
        >
          <DialogContent className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle>Update Sub-Lecture</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Sub-Lecture Title</Label>
                <Input
                  type="text"
                  placeholder="Sub-Lecture Title"
                  value={subLectureTitle}
                  onChange={(e) => setSubLectureTitle(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hours</Label>
                  <Input
                    type="number"
                    placeholder="Hours"
                    min="0"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label>Minutes</Label>
                  <Input
                    type="number"
                    placeholder="Minutes"
                    min="0"
                    max="59"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {currentVideoUrl && (
                <div className="space-y-2">
                  <Label>Current Video</Label>
                  <div className="border rounded-md p-1 bg-gray-50">
                    <video
                      src={currentVideoUrl}
                      controls
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Upload New Video (Optional)</Label>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Leave empty to keep the current video
                </p>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleCloseUpdateDialog}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                disabled={isUpdateSubLectureLoading}
                onClick={updateSubLectureHandler}
                className="w-full sm:w-auto"
              >
                {isUpdateSubLectureLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Sub-Lecture"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CreateLecture;