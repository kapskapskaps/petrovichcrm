
import { Lesson } from '../types';

const API_URL = 'http://localhost:3000/lessons';

const getHeaders = () => {
  const token = localStorage.getItem('tutor_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const lessonService = {
  getAll: async (): Promise<Lesson[]> => {
    const response = await fetch(API_URL, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Не удалось загрузить уроки');
    return response.json();
  },

  create: async (lesson: Omit<Lesson, 'id'>): Promise<Lesson> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(lesson),
    });
    if (!response.ok) throw new Error('Ошибка при создании урока');
    return response.json();
  },

  update: async (id: string, lesson: Partial<Lesson>): Promise<Lesson> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(lesson),
    });
    if (!response.ok) throw new Error('Ошибка при обновлении урока');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Ошибка при удалении урока');
  }
};
