// services/courseService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Configuration d'axios avec le token d'authentification
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT automatiquement
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const courseService = {
  // Récupérer tous les cours suivis par l'utilisateur
  async getMyCourses() {
    try {
      // Utilise la route correcte pour les étudiants
      const response = await apiClient.get('/courses/followed');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des cours suivis:', error);
      throw error;
    }
  },

  // Incrémenter les vues d'un cours
  async incrementView(courseId) {
    try {
      const response = await apiClient.post(`/courses/${courseId}/view`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'incrément du compteur de vues:', error);
      // On n'interrompt pas le flux utilisateur si la télémétrie échoue
      return null;
    }
  },

  // Récupérer tous les cours disponibles
  async getAllCourses() {
    try {
      const response = await apiClient.get('/courses');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de tous les cours:', error);
      throw error;
    }
  },

  // S'inscrire à un cours
  async enrollInCourse(courseId) {
    try {
      const response = await apiClient.post(`/courses/${courseId}/enroll`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'inscription au cours:', error);
      throw error;
    }
  },

  // Mettre à jour la progression d'un cours
  async updateProgress(courseId, progressData) {
    try {
      const response = await apiClient.put(`/courses/${courseId}/progress`, progressData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression:', error);
      throw error;
    }
  },

  // Se désinscrire d'un cours
  async unenrollFromCourse(courseId) {
    try {
      const response = await apiClient.delete(`/courses/${courseId}/unenroll`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la désinscription:', error);
      throw error;
    }
  },

  // Créer un nouveau cours (avec image)
  async createCourse(formData) {
    try {
      const response = await apiClient.post('/courses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du cours:', error);
      throw error;
    }
  },

  // Helper pour créer un FormData avec une image
  createCourseFormData(courseData) {
    const formData = new FormData();
    formData.append('name', courseData.name);
    formData.append('description', courseData.description || '');
    
    if (courseData.image) {
      formData.append('image', courseData.image);
    }
    
    return formData;
  },

  
  // Récupération des chapitres d'un cours
  async getCourseChapters(courseId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/courses/${courseId}/chapters`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des chapitres:', error);
    throw error;
  }
},

// Marquer un chapitre comme lu
async markChapterAsRead(chapterId, readingData = {}) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/chapters/${chapterId}/read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reading_time_seconds: readingData.readingTime || 0,
        ...readingData
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Erreur lors du marquage du chapitre:', error);
    throw error;
  }
},

// Télécharger un chapitre
async downloadChapter(chapterId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/chapters/${chapterId}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      // Mettre à jour le compteur de téléchargements
      await this.updateDownloadCount(chapterId);
      return response.blob();
    }
    throw new Error('Erreur lors du téléchargement');
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    throw error;
  }
},

// Mettre à jour le compteur de téléchargements
async updateDownloadCount(chapterId) {
  try {
    const token = localStorage.getItem('token');
    await fetch(`/api/chapters/${chapterId}/download-count`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du compteur:', error);
  }
},

// Récupérer la progression d'un cours spécifique
  async getCourseProgress(courseId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/student/courses/${courseId}/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de la progression:', error);
      throw error;
    }
  },

// Récupérer les devoirs d'un chapitre
async getChapterAssignments(chapterId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/chapters/${chapterId}/assignments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des devoirs:', error);
    throw error;
  }
},

// Mettre à jour la progression d'une formation/catégorie
async updateCategoryProgress(categoryId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/categories/${categoryId}/progress`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la formation:', error);
    throw error;
  }
}



};




export default courseService;