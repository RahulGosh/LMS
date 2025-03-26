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
import { Loader2, PlusCircle, ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const CreateLecture = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [subLectureTitle, setSubLectureTitle] = useState("");
  const [durationHours, setDurationHours] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [currentLectureId, setCurrentLectureId] = useState<string | null>(null);
  const [currentSubLectureId, setCurrentSubLectureId] = useState<string | null>(
    null
  );
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [openLectureIndex, setOpenLectureIndex] = useState<number | null>(null);

  const params = useParams();
  const navigate = useNavigate();
  const courseId = params.courseId || "";

  const [createLecture, { data, isLoading, isSuccess, error }] =
    useCreateLectureMutation();
  const [createSubLecture, { isLoading: isSubLectureLoading }] =
    useCreateSubLectureMutation();
  const [editSubLecture, { isLoading: isUpdateSubLectureLoading }] =
    useEditSubLectureMutation();

  const {
    data: lectureData,
    isLoading: lectureLoading,
    isError: lectureError,
    refetch,
  } = useGetCourseLectureQuery(courseId);
  const [removeSubLecture, { isLoading: isRemoving }] =
    useRemoveSubLectureMutation();

  const handleRemoveSubLecture = async (
    lectureId: string,
    subLectureId: string
  ) => {
    try {
      await removeSubLecture({ lectureId, subLectureId }).unwrap();
      toast.success("Sub-Lecture deleted successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to delete sub-lecture");
    }
  };

  // ✅ Handle Lecture Creation
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

  // ✅ Handle Sub-Lecture Creation
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

  // ✅ Handle Sub-Lecture Update
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

  // ✅ Open Dialog for Creating Sub-Lecture
  const handleOpenSubLectureDialog = (lectureId: string) => {
    setCurrentLectureId(lectureId);
    setOpenDialog(true);
  };

  // ✅ Open Dialog for Updating Sub-Lecture
  const handleOpenUpdateSubLectureDialog = (
    lectureId: string,
    subLecture: any
  ) => {
    setCurrentLectureId(lectureId);
    setCurrentSubLectureId(subLecture._id);
    setSubLectureTitle(subLecture.subLectureTitle);
    setDurationHours(subLecture.duration?.hours || 0);
    setDurationMinutes(subLecture.duration?.minutes || 0);
    setCurrentVideoUrl(subLecture.videoUrl);
    setVideoFile(null);
    setOpenUpdateDialog(true);
  };

  // Close dialogs and reset state
  const handleCloseUpdateDialog = () => {
    setOpenUpdateDialog(false);
    setSubLectureTitle("");
    setDurationHours(0);
    setDurationMinutes(0);
    setVideoFile(null);
    setCurrentVideoUrl(null);
    setCurrentSubLectureId(null);
  };

  // Handle video file change
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setVideoFile(file);
    if (file) {
      setCurrentVideoUrl(URL.createObjectURL(file));
    } else {
      setCurrentVideoUrl(null);
    }
  };

  const handleGoToEditLectureHandler = (
    courseId: string,
    lectureId: string
  ) => {
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

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-gray-50 rounded-xl shadow-md">
      {/* ✅ Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Create a New Lecture
        </h1>
        <p className="text-gray-500">
          Add details for your new lecture and optional sub-lectures.
        </p>
      </div>

      {/* ✅ Lecture Form */}
      <div className="space-y-4">
        <div>
          <Label>Lecture Title</Label>
          <Input
            type="text"
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            placeholder="Enter Lecture Title"
          />
        </div>

        <div className="flex items-center gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/courses/${courseId}`)}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Back to Course
          </Button>
          <Button
            disabled={isLoading}
            onClick={createLectureHandler}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {isLoading ? "Please wait..." : "Create Lecture"}
          </Button>
        </div>
      </div>

      {/* ✅ Display Lectures */}
      {/* ✅ Display Lectures */}
      <div className="mt-10 space-y-4">
        {lectureData?.lectures?.map((lecture, index) => (
          <Collapsible
            key={lecture._id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CollapsibleTrigger
                onClick={() =>
                  setOpenLectureIndex(openLectureIndex === index ? null : index)
                }
                className="flex w-full justify-between items-center p-5 hover:bg-blue-100 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-lg text-gray-800">
                    {lecture.lectureTitle}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    onClick={() =>
                      handleGoToEditLectureHandler(courseId, lecture._id)
                    }
                  >
                    Update Lecture
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenSubLectureDialog(lecture._id);
                    }}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add</span>
                  </Button>
                  <ChevronDown
                    className={`w-5 h-5 text-blue-700 transition-transform duration-300 ${
                      openLectureIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent>
              <div className="bg-gray-50 px-5 py-3">
                {lecture.subLectures?.length > 0 ? (
                  <div className="space-y-2 py-2">
                    {lecture.subLectures.map((subLecture, subIndex) => (
                      <div
                        key={subLecture._id}
                        className="p-3 bg-white rounded-md shadow-sm flex justify-between items-center hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-sm">
                            {subIndex + 1}
                          </div>
                          <div>
                            <p className="font-medium">
                              {subLecture.subLectureTitle}
                            </p>
                            <p className="text-sm text-gray-500">
                              {subLecture.duration?.hours || 0}h{" "}
                              {subLecture.duration?.minutes || 0}m
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            onClick={() =>
                              handleOpenUpdateSubLectureDialog(
                                lecture._id,
                                subLecture
                              )
                            }
                          >
                            Update
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              handleRemoveSubLecture(
                                lecture._id,
                                subLecture._id
                              )
                            }
                            disabled={isRemoving}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-5 text-center">
                    <p className="text-gray-500">No sub-lectures available</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenSubLectureDialog(lecture._id)}
                      className="mt-2 text-blue-600 hover:text-blue-800"
                    >
                      <PlusCircle className="w-4 h-4 mr-1" /> Add your first
                      sub-lecture
                    </Button>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}

        {lectureData?.lectures?.length === 0 && (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">
              No lectures available. Create your first lecture above.
            </p>
          </div>
        )}
      </div>

      {/* ✅ Create Sub-Lecture Dialog */}
      {/* ✅ Create Sub-Lecture Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md">
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
                />
              </div>
            </div>

            {/* Video Preview */}
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
              />
            </div>
          </div>

          <DialogFooter>
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
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              disabled={isSubLectureLoading}
              onClick={createSubLectureHandler}
            >
              {isSubLectureLoading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                "Create Sub-Lecture"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ Update Sub-Lecture Dialog */}
      <Dialog
        open={openUpdateDialog}
        onOpenChange={(open) => {
          if (!open) handleCloseUpdateDialog();
          else setOpenUpdateDialog(open);
        }}
      >
        <DialogContent className="max-w-md">
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
              />
            </div>
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
              />
            </div>

            {/* Current Video Preview */}
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
              />
              <p className="text-xs text-gray-500">
                Leave empty to keep the current video
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseUpdateDialog}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              disabled={isUpdateSubLectureLoading}
              onClick={updateSubLectureHandler}
            >
              {isUpdateSubLectureLoading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                "Update Sub-Lecture"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateLecture;
