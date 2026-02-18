
import React, { useState } from 'react';
import { authService, User } from '../services/authService';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        const user = await authService.login(email, password);
        onAuthSuccess(user);
      } else {
        if (password !== confirmPassword) {
          throw new Error("Пароли не совпадают");
        }
        const user = await authService.register(email, password);
        setSuccessMsg(`Регистрация успешна! Уведомление отправлено на почту ${email}. Теперь вы можете войти.`);
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl text-white shadow-xl mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">TutorMaster CRM</h1>
          <p className="text-gray-500 mt-2">Управляйте своим обучением эффективно</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm animate-in fade-in duration-200">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm animate-in fade-in duration-200">
                {successMsg}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="teacher@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Пароль</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {!isLogin && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Повторите пароль</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50 mt-4"
            >
              {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Создать аккаунт')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }}
              className="text-indigo-600 font-semibold hover:underline"
            >
              {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
