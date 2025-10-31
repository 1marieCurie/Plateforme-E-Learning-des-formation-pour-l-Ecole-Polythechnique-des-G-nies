import React, { useState, useEffect } from "react";
import CourseSelector from "../../components/Student/Statistics/CourseSelector";
import ProgressPerChapter from "../../components/Student/Statistics/ProgressPerChapter";
import ProgressHistoryChart from "../../components/Student/Statistics/ProgressHistoryChart";
import FeedbackList from "../../components/Student/Statistics/FeedbackList";
import CourseProgressDonut from "@/components/Student/CoursesCompletionDonut";
import courseService from "@/services/courseService";

const Statistics = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Charger la liste des cours suivis
  const [myCourses, setMyCourses] = useState([]);
  useEffect(() => {
    courseService.getMyCourses().then(setMyCourses);
  }, []);

  // Charger les stats du cours sélectionné
  useEffect(() => {
    if (selectedCourse) {
      setLoading(true);
      courseService.getCourseProgress(selectedCourse.id)
        .then((data) => setCourseData(data))
        .finally(() => setLoading(false));
    }
  }, [selectedCourse]);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Statistiques de progression</h1>

      <CourseSelector
        selected={selectedCourse}
        courses={myCourses}
        onChange={setSelectedCourse}
      />

      {loading || !courseData ? (
        <div>Chargement...</div>
      ) : (
        <>
          <ProgressPerChapter chapters={courseData.chapters || []} />
          <CourseProgressDonut progress={courseData.progress_percentage || 0} />

          <div className="flex justify-center">
            <div className="w-full md:w-2/3 lg:w-1/2">
              <ProgressHistoryChart data={courseData.progress_history || []} />
            </div>
          </div>

          <FeedbackList evaluations={courseData.evaluations || []} />
        </>
      )}
    </div>
  );
};

export default Statistics;