import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import IconBtn from '../../../../common/IconBtn'
import { IoMdAddCircleOutline } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { GrChapterNext } from "react-icons/gr";
import { setCourse, setEditCourse, setStep } from '../../../../../slices/courseSlice';
import toast from 'react-hot-toast';
import { createSection, updateSection } from '../../../../../services/operations/courseDetailsAPI';
import NestedView from './NestedView';



function CourseBuilderForm() {

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm()

    const { course } = useSelector((state) => state.course)
    const { token } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [editSectionName, setEditSectionName] = useState(null);
    const dispatch = useDispatch();



    const onSubmit = async (data) => {
        setLoading(true);

        let result;

        if (editSectionName) {
            // we are editiing subsection name
            result = await updateSection({
                sectionName: data.sectionName,
                sectionId: editSectionName,
                courseId: course._id
            }, token)
        }
        else {

            result = await createSection({
                sectionName: data.sectionName,
                courseId: course._id,
            }, token)
        }

        //console.log("CB", result);
        //update values
        if (result) {
            dispatch(setCourse(result))
            setEditSectionName(null);
            setValue('sectionName', "");

        }

        //loading false
        setLoading(false)



    }

    const cancelEdit = () => {
        setEditSectionName(null);
        setValue("sectionName", "");
    }

    const goBack = () => {
        dispatch(setStep(1));
        dispatch(setEditCourse(true));
    }

    const handleChangeEditSectionName = (sectionId, sectionName) => {
        if (editSectionName === sectionId) {
            cancelEdit()
            return;
        }

        setEditSectionName(sectionId);
        setValue("sectionName", sectionName);


    }

    const goToNext = () => {

        if (course.courseContent.length === 0) {
            toast.error("Please add atleast one section");
            return

        }

        if (course.courseContent.some((section) => section.subSection.length === 0)) {
            toast.error("Please add atleast one lecture in each section")
            return;
        }

        //if everthing is  good
        dispatch(setStep(3));


    }



    return (
        <div className="space-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
            <p className="text-2xl font-semibold text-richblack-5">
                Course Builder
            </p>
            <form onSubmit={handleSubmit(onSubmit)}
                className="space-y-4">
                <div className="flex flex-col space-y-2">
                    <label className="text-sm text-richblack-5" htmlFor="sectionName"> Section Name
                        <sup>*</sup>
                    </label>
                    <input type="text"
                        id='sectionName'
                        placeholder='Add section name'
                        {...register("sectionName", { required: true })}
                        className="form-style w-full"
                    />
                    {
                        errors.sectionName && (
                            <span className="ml-2 text-xs tracking-wide text-pink-200">section name is required</span>
                        )
                    }
                </div>

                <div className="flex items-end gap-x-4">
                    <IconBtn type="submit"
                        disabled={loading}
                        text={editSectionName ? "Edit Section Name" : "Create Section"}
                        outline={true}
                    >
                        <IoMdAddCircleOutline size={20} className="text-yellow-50" />

                    </IconBtn>
                    {
                        editSectionName && (
                            <button type='button'
                                onClick={cancelEdit}
                                className="text-sm text-richblack-300 underline"
                            >Cancel Edit
                            </button>
                        )
                    }
                </div>
            </form>


            {/* Nested view */}
            {

                course?.courseContent?.length > 0 && (
                    <NestedView handleChangeEditSectionName={handleChangeEditSectionName} ></NestedView>
                )
            }

            {/* Next Prev Button */}

            <div className="flex justify-end gap-x-3">
                <button onClick={goBack} className={`flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900`}>
                    Back
                </button>
                <IconBtn disabled={loading} text="Next" onclick={goToNext}>
                    <GrChapterNext />
                </IconBtn>
            </div>

        </div>
    )
}

export default CourseBuilderForm

