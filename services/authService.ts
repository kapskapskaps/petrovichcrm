
export interface User {
  id: string;
  email: string;
}

const USERS_KEY = 'tutor_crm_users';

export const authService = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  register: async (email: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = authService.getUsers();
    if (users.find(u => u.email === email)) {
      throw new Error("Пользователь с такой почтой уже существует");
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email
    };

    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    
    // Simulate sending an email
    console.log(`%c[Email Service] Sending registration confirmation to ${email}...`, "color: #4f46e5; font-weight: bold;");
    
    return newUser;
  },

  login: async (email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const users = authService.getUsers();
    const user = users.find(u => u.email === email);
    
    // In a real app, we'd check the password hash
    if (!user) {
      throw new Error("Неверная почта или пароль");
    }

    return user;
  }
};
