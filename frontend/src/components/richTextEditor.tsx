import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Define the type for the input state
export interface CourseInputState {
  courseTitle: string;
  subTitle: string;
  description: string;
  category: string;
  courseLevel: string;
  coursePrice: string;
  courseThumbnail: string | File; // Updated to accept both string and File
}

// Define the props for the component
interface RichTextEditorProps {
  input: CourseInputState; // Change type to CourseInputState
  setInput: React.Dispatch<React.SetStateAction<CourseInputState>>;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ input, setInput }) => {
  const handleChange = (content: string) => {
    setInput({ ...input, description: content });
  };

  return (
    <ReactQuill theme="snow" value={input.description} onChange={handleChange} />
  );
};

export default RichTextEditor;
