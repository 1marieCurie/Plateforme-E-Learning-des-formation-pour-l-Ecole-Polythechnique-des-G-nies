import React, { useState, useEffect } from 'react';

const TestAPIComponent = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch('/api/my-courses', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Données reçues:', data);
        setCourses(data);
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      <h1>Test API - Mes Cours</h1>
      <p>Nombre de cours: {courses.length}</p>
      <ul>
        {courses.map(course => (
          <li key={course.id}>
            {course.title} (ID: {course.id})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TestAPIComponent;
