import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { fetchInstructorCourses } from '../../../services/operations/courseDetailsAPI';
import IconBtn from '../../common/IconBtn';
import CourseTable from './InstructorCourses/CourseTable';

function MyCourses() {


    const { token } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);

    useEffect(() => {

        const fetchCourses = async () => {
            const result = await fetchInstructorCourses(token);
            if (result) {
                setCourses(result);
            }
        }
        fetchCourses();

    }, [])

    return (
        <div className='text-white'>
            <div className='flex justify-between'>
                <h1>My Courses</h1>
                <IconBtn text={"Add Course"}
                    onclick={() => navigate("/dashboard/add-course")}>
                    {/* Add icon */}
                </IconBtn>
            </div>

            {
                courses && <CourseTable courses={courses}
                    setCourses={setCourses}>
                </CourseTable>
            }
        </div>
    )
}

export default MyCourses