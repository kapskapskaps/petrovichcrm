
export interface User {
  id: string;
  email: string;
  token?: string;
}

const API_URL = 'http://localhost:3000';

export const authService = {
  register: async (email: string, password: string): Promise<User> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка регистрации');
    }

    return response.json();
  },

  login: async (email: string, password: string): Promise<User> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Неверная почта или пароль');
    }

    const userData = await response.json();
    // Сохраняем только токен для сессии
    if (userData.token) {
      localStorage.setItem('tutor_token', userData.token);
    }
    return userData;
  },

  logout: () => {
    localStorage.removeItem('tutor_token');
    localStorage.removeItem('tutor_current_user');
  }
};
