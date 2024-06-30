const CourseProgress = require("../models/CourseProgress");
const SubSection = require("../models/SubSection")

exports.updateCourseProgress = async (req, res) => {
    const { courseId, subSectionId } = req.body;
    const userId = req.user.id;

    try {
        //Check if subSection is valid

        const subSection = await SubSection.findById(subSectionId);

        if (!subSection) {
            return res.status(404).json({
                error: "Invalid SubSection"
            })
        }

        //Check for old Entry
        let courseProgress = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId
        })

        if (!courseProgress) {
            return res.status(404).json({
                success: false,
                message: "Course Progress does not exist"
            })
        }
        else {
            //check for re-completing video/
            if (courseProgress.completedVideos.includes(subSection)) {

                return res.status(400).json({
                    error: "SubSection already completed"
                })
            }

            //Push into Completed Video
            courseProgress.completedVideos.push(subSectionId);

            await courseProgress.save();
            return res.status(200).json({
                success: true,
                message: "Course Progress Updated Successfully"
            })


        }

    } catch (error) {
        console.error(error);
        return res.status(400).json({
            error: "Internal Server Error"
        })

    }

}