import { Response } from "express";
import { AuthenticatedRequest, CreateCourseCustomRequest } from "../types/types";
import { Course } from "../models/courseModel";
import { CoursePurchase } from "../models/coursePurchaseModel";
import Stripe from "stripe";
import { Lecture } from "../models/lectureModel";
import { User } from "../models/userModel";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export const createCheckoutSession = async (req: CreateCourseCustomRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.body;
    const userId = req.user?._id || req.id;

    // Fetch the course from the database
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found!",
      });
      return;
    }

    // Ensure coursePrice is defined before proceeding
    const coursePrice = course?.coursePrice;
    if (!coursePrice) {
      res.status(400).json({
        success: false,
        message: "Course price is not available.",
      });
      return;
    }

    // Create a new purchase record
    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      amount: coursePrice,
      status: "pending",
    });

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: course.courseTitle,
              images: [course.courseThumbnail],
            },
            unit_amount: coursePrice * 100, // Convert to paise (100 paise = 1 INR)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/course-progress/${courseId}`,
      cancel_url: `${process.env.FRONTEND_URL}/course-detail/${courseId}`,
      metadata: {
        courseId: courseId,
      },
    } as unknown as Stripe.Checkout.SessionCreateParams);

    if (!session.url) {
      res.status(400).json({
        success: false,
        message: "Error while creating checkout session.",
      });
      return;
    }

    // Save the payment ID to the purchase record
    newPurchase.paymentId = session.id;
    await newPurchase.save();

    // Return the Stripe checkout URL
    res.status(200).json({
      success: true,
      url: session.url,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the checkout session.",
    });
    return;
  }
};

export const stripeWebhook = async (req: CreateCourseCustomRequest, res: Response): Promise<void> => {
  console.log("Stripe Webhook API called"); // Log to confirm the API is triggered
  let event;

  try {
    const payloadString = JSON.stringify(req.body, null, 2);
    const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

    if (!secret) {
      throw new Error('Webhook secret not found');
    }

    const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret,
    });

    event = stripe.webhooks.constructEvent(payloadString, header, secret);
  } catch (error: any) {
    console.error("Webhook error:", error.message);
    res.status(400).send(`Webhook error: ${error.message}`);
    return;
  }

  // Handle the checkout session completed event
  if (event.type === "checkout.session.completed") {
    console.log("checkout.session.completed event received:", event.data.object);

    try {
      const session = event.data.object;
      console.log("Stripe Event Data:", event.data.object);

      const purchase = await CoursePurchase.findOne({
        paymentId: session.id,
      })
        .populate({
          path: "courseId",
          populate: {
            path: "lectures", // populate the lectures field as well
            model: "Lecture",  // specify the model for the lectures
          },
        });

      if (!purchase) {
        res.status(404).json({ message: "Purchase not found" });
        return;
      }

      // Ensure courseId is populated as a full Course object
      const course = purchase.courseId;  // Now it's the full Course document
      console.log(course, "course")
      if (session.amount_total) {
        purchase.amount = session.amount_total / 100;
      }
      console.log("Updating Purchase Status to Completed");

      purchase.status = "completed";
      await purchase.save();

      console.log("Purchase Updated Successfully:", purchase);

      // Make all lectures visible by setting `isPreviewFree` to true
      if (purchase.courseId && purchase.courseId.lectures && course?.lectures.length > 0) {
        await Lecture.updateMany(
          { _id: { $in: course.lectures } },
          { $set: { isPreviewFree: true } }
        );
      }

      await purchase.save();

      // Update user's enrolledCourses
      const updatedUser = await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId._id } },
        { new: true }
      );
      
      if (!updatedUser) {
        console.error("Failed to update user's enrolledCourses");
         res.status(500).json({ message: "Failed to update user's enrolledCourses" });
         return;
      }
      
      console.log("Updated User:", updatedUser);

      // Update course to add user ID to enrolledStudents
      await Course.findByIdAndUpdate(
        purchase.courseId._id,
        { $addToSet: { enrolledStudents: purchase.userId } },
        { new: true }
      );
      console.log("Updating user's enrolledCourses with courseId:", purchase.courseId._id);

    } catch (error) {
      console.error("Error handling event:", error);
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
  }

  res.status(200).send();
};

export const getCourseDetailWithStatusQuery = async (req: CreateCourseCustomRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params
    const userId = req.user?._id || req.id

    const course = await Course.findById(courseId).populate({ path: "creator" }).populate({ path: "lectures" })

    const purchased = await CoursePurchase.findOne({ userId, courseId })

    if (!course) {
      res.status(404).json({ message: "course not found!" });
      return;
    }

    res.status(200).json({
      course,
      purchased: !!purchased,
    });
    return
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to get course purchased detail"
    })
    return;
  }
}

export const getAllPurchasedCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const purchasedCourse = await CoursePurchase.find({
      status: "completed"
    }).populate("courseId")

    if (!purchasedCourse) {
      res.status(400).json({
        purchasedCourse: []
      })
      return;
    }

    res.status(200).json({
      success: true,
      purchasedCourse
    })
    return;
  } catch (error) {
    console.log(error)
  }
}