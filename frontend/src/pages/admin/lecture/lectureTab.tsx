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
import { Switch } from "@/components/ui/switch";
import {
  useEditLectureMutation,
  useGetLectureByIdQuery,
  useRemoveLectureMutation,
} from "@/features/api/courseApi";
// import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const LectureTab: React.FC = () => {
  const [input, setInput] = useState<{
    lectureTitle: string;
    isFree: boolean;
    videoFile: File | null;
  }>({
    lectureTitle: "",
    isFree: false,
    videoFile: null,
  });

  const params = useParams();
  const courseId = params.courseId || "";
  const lectureId = params.lectureId || "";
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [editLecture, { isLoading: isMutationLoading, isSuccess, error }] =
    useEditLectureMutation();
  const [
    removeLecture,
    { data: removeData, isLoading: removeLoading, isSuccess: removeSuccess },
  ] = useRemoveLectureMutation();
  const {
    data: lectureData,
    isLoading: lectureIsLoading,
    isSuccess: lectureIsSuccess,
  } = useGetLectureByIdQuery({ lectureId }, { skip: !lectureId });

  const navigate = useNavigate();

  useEffect(() => {
    if (lectureIsSuccess && lectureData?.lecture) {
      const lecture = lectureData.lecture;
      setInput({
        lectureTitle: lecture.lectureTitle || "",
        isFree: lecture.isFree || false,
        videoFile: null,
      });
    }
  }, [lectureIsSuccess, lectureData]);

  const changeEventHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setInput({ ...input, [name]: type === "checkbox" ? checked : value });
  };

  const selectVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput({ ...input, videoFile: file });
      const videoURL = URL.createObjectURL(file);
      setPreviewVideo(videoURL);
    }
  };

  useEffect(() => {
    if (isSuccess || error) {
      toast[isSuccess ? "success" : "error"](
        isSuccess ? "Lecture updated successfully" : "Failed to update lecture"
      );
      if (isSuccess) navigate(`/admin/courses/${courseId}`);
    }
  }, [isSuccess, error, navigate, courseId]);

  const updateLectureHandler = async () => {
    if (!lectureId || !courseId) return;

    const formData = new FormData();
    formData.append("lectureTitle", input.lectureTitle);
    formData.append("isFree", input.isFree.toString());

    setIsUploading(true);

    await editLecture({
      formData,
      courseId,
      lectureId,
    });

    setIsUploading(false);
  };

  const removeLectureHandler = async () => {
    await removeLecture({ lectureId }); // Pass an object with the lectureId
  };

  useEffect(() => {
    if (removeSuccess) {
      toast.success(removeData.message);
      navigate(`/admin/courses/${courseId}`);
    }
  }, [removeSuccess]);

  if (lectureIsLoading) return <h1>Loading...</h1>;

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>Edit Lecture</CardTitle>
          <CardDescription>
            Make changes and click save when done.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={removeLoading}
            variant="destructive"
            onClick={removeLectureHandler}
          >
            {removeLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Remove Lecture"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Label>Title</Label>
          <Input
            type="text"
            name="lectureTitle"
            value={input.lectureTitle}
            onChange={changeEventHandler}
            placeholder="Ex. Introduction to Javascript"
          />
        </div>
        {/* <div className="flex items-center space-x-2 my-5">
          <Switch
            checked={input.isFree}
            onCheckedChange={(value) =>
              setInput({ ...input, isFree: value })
            }
            id="is-free"
          />
          <Label htmlFor="is-free">Is this video FREE</Label>
        </div> */}

        {/* {isUploading && (
          <div className="my-4">
            <Progress value={uploadProgress} />
            <p>{uploadProgress}% uploaded</p>
          </div>
        )} */}

        <div className="mt-4">
          <Button
            disabled={isMutationLoading || isUploading}
            onClick={updateLectureHandler}
          >
            {isMutationLoading || isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Update Lecture"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureTab;
