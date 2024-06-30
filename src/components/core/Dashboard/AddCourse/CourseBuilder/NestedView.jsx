import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RxDropdownMenu } from "react-icons/rx";
import { MdEdit } from "react-icons/md";

import { MdDelete } from "react-icons/md";
import { MdOutlineArrowDropDownCircle } from "react-icons/md";
import { CiCirclePlus } from 'react-icons/ci';
import SubSectionModal from './SubSectionModal';
import { deleteSection, deleteSubSection } from '../../../../../services/operations/courseDetailsAPI';
import { setCourse } from '../../../../../slices/courseSlice';
import ConfirmationModal from "../../../../common/ConfirmationModal"


function NestedView({ handleChangeEditSectionName }) {
    const { course } = useSelector((state) => state.course);

    const { token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [addSubSection, setAddSubsection] = useState(null)
    const [viewSubSection, setViewSubSection] = useState(null)
    const [editSubSection, setEditSubSection] = useState(null)
    const [confirmationModal, setConfirmationModal] = useState(null)

    const handleDeleteSection = async (sectionId) => {
        const result = await deleteSection({
            sectionId, courseId: course._id, token,
        });

        if (result) {
            dispatch(setCourse(result));
        }
        setConfirmationModal(null);
    }

    const handleDeleteSubSection = async (subSectionId, sectionId) => {
        const result = await deleteSubSection({ subSectionId, sectionId, token });

        if (result) {
            // extra kya kar sakte
            const updatedCourseContent = course.courseContent.map((section) => section._id === sectionId ? result : section);
            const updatedCourse = { ...course, courseContent: updatedCourseContent }
            dispatch(setCourse(updatedCourse));
        }
        setConfirmationModal(null);
    }

    return (


        <>
            <div className="rounded-lg bg-richblack-700 p-6 px-8" id="nestedViewContainer">
                {
                    course?.courseContent?.map((section) => (

                        <details key={section._id} open>

                            <summary className="flex cursor-pointer items-center justify-between border-b-2 border-b-richblack-600 py-2">
                                <div className="flex items-center gap-x-3">
                                    <RxDropdownMenu className="text-2xl text-richblack-50">
                                    </RxDropdownMenu>
                                    <p className="font-semibold text-richblack-50">{section.sectionName}</p>
                                </div>
                                <div className="flex items-center gap-x-3">
                                    <button
                                        onClick={() => {
                                            handleChangeEditSectionName(section._id, section.sectionName)
                                        }}>
                                        <MdEdit className="text-xl text-richblack-300"></MdEdit>
                                    </button>

                                    <button
                                        onClick={() =>
                                            setConfirmationModal({
                                                text1: "Delete this Section?",
                                                text2: "All the lectures in this section will be deleted",
                                                btn1Text: "Delete",
                                                btn2Text: "Cancel",
                                                btn1Handler: () => handleDeleteSection(section._id),
                                                btn2Handler: () => setConfirmationModal(null),
                                            })
                                        }
                                    >
                                        <MdDelete className="text-xl text-richblack-300" ></MdDelete>
                                    </button>

                                    <span className="font-medium text-richblack-300">|</span>
                                    <MdOutlineArrowDropDownCircle className={`text-xl text-richblack-300`} />
                                </div>
                            </summary>

                            <div className="px-6 pb-4">
                                {
                                    section.subSection.map((data) => (
                                        <div key={data?._id}
                                            onClick={() => {
                                                setViewSubSection(data)
                                            }}
                                            className="flex cursor-pointer items-center justify-between gap-x-3 border-b-2 border-b-richblack-600 py-2">

                                            <div className="flex items-center gap-x-3 py-2 ">
                                                <RxDropdownMenu className="text-2xl text-richblack-50">
                                                </RxDropdownMenu>
                                                <p className="font-semibold text-richblack-50">{data.title}</p>
                                            </div>

                                            <div onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-x-3">
                                                <button
                                                    onClick={() => setEditSubSection({ ...data, sectionId: section._id })}>
                                                    <MdEdit className="text-xl text-richblack-300"></MdEdit>
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        setConfirmationModal({
                                                            text1: "Delete this SubSection?",
                                                            text2: "Selected Lecture will be deleted",
                                                            btn1Text: "Delete",
                                                            btn2Text: "Cancel",
                                                            btn1Handler: () => handleDeleteSubSection(data._id, section._id),
                                                            btn2Handler: () => setConfirmationModal(null),
                                                        })
                                                    }>
                                                    <MdDelete className="text-xl text-richblack-300"></MdDelete>
                                                </button>

                                            </div>



                                        </div>
                                    ))
                                }

                                <button
                                    onClick={() => {
                                        setAddSubsection(section._id)
                                    }} className="mt-3 flex items-center gap-x-1 text-yellow-50">
                                    <CiCirclePlus className="text-lg"></CiCirclePlus>
                                    <p>Add Lecture</p>
                                </button>
                            </div>

                        </details>

                    ))
                }
            </div>

            {/* Modal Display */}

            {addSubSection ? (<SubSectionModal
                modalData={addSubSection}
                setModalData={setAddSubsection}
                add={true}></SubSectionModal>) :
                viewSubSection ? (<SubSectionModal modalData={viewSubSection}
                    setModalData={setViewSubSection}
                    view={true}></SubSectionModal>) :
                    editSubSection ? (<SubSectionModal
                        modalData={editSubSection}
                        setModalData={setEditSubSection}
                        edit={true}></SubSectionModal>)
                        : (<></>)
            }
            {/* Confirmation Modal */}
            {
                confirmationModal ? <ConfirmationModal modalData={confirmationModal}></ConfirmationModal> : (<></>)
            }


        </>
    )
}

export default NestedView