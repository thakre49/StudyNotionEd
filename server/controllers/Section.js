const Course = require("../models/Course");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");

// exports.createSection = async (req, res) => {
//   try {
//     //fetch the data
//     const { sectionName, courseId } = req.body;

//     //data validation
//     if (!sectionName || !courseId) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing Properties",
//       });
//     }

//     //create section
//     const newSection = await Section.create({ sectionName });

//     //update the course with section Object id
//     const updatedCourseDetails = await Course.findByIdAndUpdate(
//       courseId,
//       {
//         $push: {
//           courseContent: newSection._id,
//         },
//       },
//       { new: true }
//     )
//       .populate({
//         path: "courseContent",
//         populate: {
//           path: "subSection",
//         },
//       })
//       .exec();

//     //return response
//     return res.status(200).json({
//       success: true,
//       message: "Section created successfully",
//       updatedCourseDetails,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Unable to create section, please try again",
//       error: error.message,
//     });
//   }
// };

exports.createSection = async (req, res) => {
  try {
    // Extract the required properties from the request body
    const { sectionName, courseId } = req.body;
    console.log(req.body);

    //Validate the input
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing required properties",
      });
    }

    // Create a new section with the given name
    const newSection = await Section.create({ sectionName });

    // Add the new section to the course's content array
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    // Return the updated course object in the response
    res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourse,
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


//Update Section
exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId, courseId } = req.body;
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );

    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    res.status(200).json({
      success: true,
      message: section,
      data: course,
    });
  } catch (error) {
    console.error("Error updating section:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//Deleting a section
exports.deleteSection = async (req, res) => {
  try {
    //HW test with req.params
    //get  ID - we are sending ID in params
    const { sectionId, courseId } = req.body;

    //TODO:[Testing] do we need to delete the entry from the course schema
    await Course.findByIdAndUpdate(courseId, {
      $pull: {
        courseContent: sectionId,
      },
    });

    const section = await Section.findById(sectionId);
    console.log(sectionId, courseId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // Delete the associated subsections
    await SubSection.deleteMany({ _id: { $in: section.subSection } });

    //use findbyidanddelete
    await Section.findByIdAndDelete(sectionId);

    // find the updated course and return it
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    //return response
    return res.status(200).json({
      success: true,
      message: "Section Deleted Successfully",
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting section",
      error: error.message,
    });
  }
};
