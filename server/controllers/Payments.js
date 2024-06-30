
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const {
  paymentSuccessEmail,
} = require("../mail/templates/paymentSuccessEmail");
const Course = require("../models/Course");
const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("../models/User");
const CourseProgress = require("../models/CourseProgress");


//Initialize the razorpay order 
exports.capturePayment = async (req, res) => {

  const { courses } = req.body;
  const userId = req.user.id;

  if (courses.length === 0) {
    return res.json({
      success: false,
      message: "Please provide course ID"
    })
  }

  let totalAmount = 0;
  for (const course_id of courses) {
    let course;
    try {


      course = await Course.findById(course_id)
      if (!course) {
        return res.status(200).json({
          success: false,
          message: "Could not find the course"
        })
      }

      const uid = new mongoose.Types.ObjectId(userId);
      if (course.studentsEnrolled.includes(uid)) {

        return res.status(200).json({
          success: false,
          message: "Student is already enrolled"
        })
      }

      totalAmount += course.price;



    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        message: error.message
      })

    }
  }

  const options = {
    amount: totalAmount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString()
  }

  return res.status(200).json({
    success: true,
    message: options,

  })



}


// Verify the payment
exports.verifyPayment = async (req, res) => {

  const courses = req.body?.courses;
  const userId = req.user.id;

  console.log("Print courses....", courses);

  if (!courses || !userId) {
    return res.status(500).json({
      success: false,
      message: "Payment Failed"

    })
  }


  await enrollStudents(courses, userId, res);


  //return response
  return res.status(200).json({
    success: true,
    message: "Payment Verified"
  })


}


const enrollStudents = async (courses, userId, res) => {

  if (!courses || !userId) {
    return res.status(400).json({
      success: false,
      message: "Please data for Courses or UserId"
    })
  }

  for (const courseId of courses) {
    try {


      //find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        {
          _id: courseId
        },
        {
          $push: { studentsEnrolled: userId }
        },
        {
          new: true
        }
      )

      if (!enrolledCourse) {
        return res.status(500).json({
          success: false, message: "Course not found"
        })
      }

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: []
      })

      //find the student and add the course to their list of courses
      const enrolledStudent = await User.findByIdAndUpdate(userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id
          }
        }, { new: true })

      //Send mail to student

      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully enroled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)
      )
      console.log("Email Sent Successfully", emailResponse);


    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message
      })

    }

  }

}


// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body

  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    const enrolledStudent = await User.findById(userId)

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )
  } catch (error) {
    console.log("error in sending mail", error)
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" })
  }
}


















































































// //capture the payment and initiate the Razorpay order
// exports.capturePayment = async (req, res) => {
//   //get courseId and userID
//   const { courseId } = req.body;
//   const userId = req.user.id;

//   //vallidation
//   //valid courseId
//   if (!courseId) {
//     return res.json({
//       success: false,
//       message: "Please provide valid course ID",
//     });
//   }

//   //validcourseDetail
//   let course;
//   try {
//     course = await Course.findById(courseId);
//     if (!course) {
//       return re.json({
//         success: false,
//         message: "Could not find the course",
//       });
//     }

//     //User alreddy pay for the same course
//     const uid = mongoose.Types.ObjectId(userId); //converting string to object id
//     if (course.studentsEnrolled.includes(uid)) {
//       return res.status(200).json({
//         success: false,
//         message: "Student is already enrolled",
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status().json({
//       success: false,
//       message: error.message,
//     });
//   }

//   //order create
//   const amount = course.price;
//   const currency = "INR";

//   const options = {
//     amount: amount * 100,
//     currency: currency,
//     receipt: Math.random(Date.now()).toString(),
//     notes: {
//       courseId: courseId,
//       userId,
//     },
//   };

//   try {
//     //initiate the payment using razorpay
//     const paymentResponse = await instance.orders.create(options);

//     console.log(paymentResponse);
//     //return response
//     return res.status(200).json({
//       success: true,
//       courseName: course.courseName,
//       courseDescription: course.courseDescription,
//       thumbnail: course.thumbnail,
//       orderId: paymentResponse.id,
//       currency: paymentResponse.currency,
//       amount: paymentResponse.amount,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.json({
//       success: false,
//       message: "Could not initiate order",
//     });
//   }
// };

// //verify Signature of Razorpay and server
// exports.verifySignature = async (req, res) => {
//   const webHookSecret = "12345678";

//   const signature = req.headers["x-razorpay-signature"];

//   const shasum = crypto.createHmac("sha256", webHookSecret);

//   shasum.update(JSON.stringify(req.body));

//   const digest = shasum.digest("hex");

//   if (signature === digest) {
//     console.log("Payment is Authorized");

//     const { courseId, userId } = req.body.payload.payment.entity.notes;

//     try {
//       //fullfil the action
//       //find the course and enroll the student in it
//       const enrolledCourse = Course.findOneAndUpdate(
//         { _id: courseId },
//         {
//           $push: {
//             studentsEnrolled: userId,
//           },
//         },
//         { new: true }
//       );

//       if (!enrolledCourse) {
//         return res.status(500).json({
//           success: false,
//           message: "Course not found",
//         });
//       }
//       console.log(enrolledCourse);

//       //find the student and add the course to list of enrolled courses

//       const enrolledStudent = await User.findOneAndUpdate(
//         { _id: userId },
//         {
//           $push: {
//             courses: courseId,
//           },
//         },
//         { new: true }
//       );

//       console.log(enrolledStudent);

//       //mail send kardo confirmation ka
//       const emailResponse = await mailSender(
//         enrolledStudent.email,
//         "Congratulations",
//         "you are onboard into new Codehelp code"
//       );

//       console.log(emailResponse);
//       return res.status(200).json({
//         success: true,
//         message: "Signature Verified and Course Added",
//       });
//     } catch (error) {
//       console.log(error);
//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   } else {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid request",
//     });
//   }
// };
