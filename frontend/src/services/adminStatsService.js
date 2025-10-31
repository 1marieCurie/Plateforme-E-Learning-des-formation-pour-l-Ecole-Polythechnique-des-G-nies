// Service pour récupérer les statistiques admin
import api from "../api/axios";

export async function getPublishedCoursesCount() {
  try {
    const res = await api.get("/courses");
    // Filtrer les cours actifs côté client
    const activeCourses = res.data.filter(course => course.is_active === 1 || course.is_active === true);
    return activeCourses.length;
  } catch (error) {
    console.error("Erreur lors de la récupération des cours publiés:", error);
    return 0;
  }
}
