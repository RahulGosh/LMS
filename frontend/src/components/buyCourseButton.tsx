import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateCheckoutSessionMutation } from "@/features/api/purchaseApi";

const BuyCourseButton = ({ courseId }: { courseId: string }) => {
  const [
    createCheckoutSession,
    { data, isLoading, isSuccess, isError, error },
  ] = useCreateCheckoutSessionMutation();

  const purchaseCourseHandler = async () => {
    await createCheckoutSession(courseId);
  };

  useEffect(()=>{
    if(isSuccess){
       if(data?.url){
        window.location.href = data.url; // Redirect to stripe checkout url
       }else{
        toast.error("Invalid response from server.")
       }
    } 
    if(isError){
      toast.error(data?.message || "Failed to create checkout session")
    }
  },[data, isSuccess, isError, error])

  return (
    <Button
    disabled={isLoading}
    onClick={purchaseCourseHandler}
    className="w-full"
  >
    {isLoading ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Please wait
      </>
    ) : (
      "Purchase Course"
    )}
  </Button>
  );
};

export default BuyCourseButton;