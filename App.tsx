
import React, { useState, useEffect, useRef } from 'react';
import { Lesson, LessonInstance, DAYS, HOURS, DayOfWeek, ScheduleSlot } from './types';
import LessonForm from './components/LessonForm';
import LessonDetailModal from './components/LessonDetailModal';
import AuthPage from './components/AuthPage';
import { User, authService } from './services/authService';
import { lessonService } from './services/lessonService';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('tutor_current_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [lessonToEdit, setLessonToEdit] = useState<Lesson | null>(null);
  const [prefilledSlot, setPrefilledSlot] = useState<ScheduleSlot | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonInstance | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const sentRemindersRef = useRef<{ [key: string]: string }>({});

  // Загрузка уроков из БД при входе пользователя
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tutor_current_user', JSON.stringify(currentUser));
      fetchLessons();
    } else {
      setLessons([]);
    }
  }, [currentUser]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const data = await lessonService.getAll();
      setLessons(data);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const handleSaveLesson = async (lessonData: Lesson) => {
    try {
      if (lessonToEdit) {
        const updated = await lessonService.update(lessonToEdit.id, lessonData);
        setLessons(lessons.map(l => l.id === updated.id ? updated : l));
        showToast('Урок успешно обновлен', 'success');
      } else {
        const created = await lessonService.create(lessonData);
        setLessons([...lessons, created]);
        showToast('Урок добавлен в базу данных', 'success');
      }
      setIsFormOpen(false);
      setLessonToEdit(null);
      setPrefilledSlot(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateLesson = async (updatedLesson: Lesson) => {
    try {
      const result = await lessonService.update(updatedLesson.id, updatedLesson);
      setLessons(lessons.map(l => l.id === result.id ? result : l));
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteLesson = async (id: string, onlyThisDay: boolean) => {
    try {
      if (onlyThisDay && selectedLesson) {
        const lesson = lessons.find(l => l.id === id);
        if (lesson) {
          const newSlots = lesson.slots.filter(s => 
            !(s.dayOfWeek === selectedLesson.currentSlot.dayOfWeek && s.time === selectedLesson.currentSlot.time)
          );
          if (newSlots.length === 0) {
            await lessonService.delete(id);
            setLessons(lessons.filter(l => l.id !== id));
          } else {
            const updated = await lessonService.update(id, { slots: newSlots, frequency: newSlots.length });
            setLessons(lessons.map(l => l.id === id ? updated : l));
          }
        }
      } else {
        await lessonService.delete(id);
        setLessons(lessons.filter(l => l.id !== id));
      }
      setSelectedLesson(null);
      showToast('Удалено из базы данных', 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleMarkCompleted = async (id: string) => {
    const lesson = lessons.find(l => l.id === id);
    if (lesson) {
      try {
        const updated = await lessonService.update(id, { lessonNumber: lesson.lessonNumber + 1 });
        setLessons(lessons.map(l => l.id === id ? updated : l));
        setSelectedLesson(null);
        showToast('Статус урока обновлен', 'success');
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    }
  };

  // Вспомогательные функции для календаря
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };
  const startOfWeek = getStartOfWeek(viewDate);
  const goToPreviousWeek = () => { const prev = new Date(viewDate); prev.setDate(prev.getDate() - 7); setViewDate(prev); };
  const goToNextWeek = () => { const next = new Date(viewDate); next.setDate(next.getDate() + 7); setViewDate(next); };
  const goToToday = () => setViewDate(new Date());
  const formatDateRange = () => {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return `${startOfWeek.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} — ${endOfWeek.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`;
  };
  const getDayDate = (index: number) => { const d = new Date(startOfWeek); d.setDate(d.getDate() + index); return d.getDate(); };

  if (!currentUser) return <AuthPage onAuthSuccess={setCurrentUser} />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col animate-in fade-in duration-500">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">PetrovichCRM</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <button onClick={goToPreviousWeek} className="p-2 hover:bg-white rounded-lg transition-all text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button onClick={goToToday} className="px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-white rounded-lg transition-all mx-1">Сегодня</button>
            <button onClick={goToNextWeek} className="p-2 hover:bg-white rounded-lg transition-all text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
          <div className="text-sm font-bold text-indigo-900 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
            {formatDateRange()}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <span className="text-xs font-bold text-gray-900">{currentUser.email}</span>
            <button onClick={handleLogout} className="text-[10px] text-indigo-600 font-bold hover:underline">Выйти</button>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
            {currentUser.email.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 flex flex-col relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}
        
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 flex-1 overflow-hidden flex flex-col">
          <div className="calendar-grid border-b bg-gray-50/50">
            <div className="p-4"></div>
            {DAYS.map((day, index) => {
              const dateNum = getDayDate(index);
              const isToday = new Date().toDateString() === new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + index)).toDateString();
              return (
                <div key={day} className={`p-4 text-center border-l first:border-l-0 ${isToday ? 'bg-indigo-50/50' : ''}`}>
                  <span className={`block text-xs font-bold uppercase tracking-wider ${isToday ? 'text-indigo-600' : 'text-gray-400'}`}>{day.substring(0, 3)}</span>
                  <span className={`inline-flex items-center justify-center w-8 h-8 mt-1 rounded-full text-lg font-bold ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-800'}`}>{dateNum}</span>
                </div>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar relative">
            <div className="calendar-grid min-h-full">
              <div className="flex flex-col">
                {HOURS.map(hour => <div key={hour} className="h-20 border-b p-2 text-[11px] font-medium text-gray-400 text-right pr-4">{hour}</div>)}
              </div>
              {DAYS.map(day => (
                <div key={day} className="border-l relative group">
                  {HOURS.map(hour => (
                    <div 
                      key={`${day}-${hour}`} 
                      onClick={() => { setPrefilledSlot({ dayOfWeek: day, time: hour }); setIsFormOpen(true); }}
                      className="h-20 border-b relative hover:bg-indigo-50/30 transition-colors cursor-crosshair group/slot"
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-opacity">
                        <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                      </div>
                      {lessons.flatMap(lesson => 
                        lesson.slots
                          .filter(slot => slot.dayOfWeek === day && slot.time.startsWith(hour.split(':')[0].padStart(2, '0')))
                          .map(slot => (
                            <div
                              key={`${lesson.id}-${slot.dayOfWeek}-${slot.time}`}
                              onClick={(e) => { e.stopPropagation(); setSelectedLesson({ ...lesson, currentSlot: slot }); }}
                              className="absolute inset-x-1 top-1 bg-indigo-100 border-l-4 border-indigo-600 p-2 rounded-lg cursor-pointer hover:bg-indigo-200 transition shadow-sm z-10 overflow-hidden"
                              style={{ height: 'calc(100% - 8px)' }}
                            >
                              <div className="font-bold text-indigo-900 text-xs truncate">{lesson.studentName}</div>
                              <div className="text-[10px] text-indigo-700 truncate">{lesson.course}</div>
                            </div>
                          ))
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Тосты */}
      <div className="fixed top-20 right-8 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`max-w-xs w-full bg-white border-l-4 ${toast.type === 'error' ? 'border-red-500' : 'border-indigo-600'} p-4 rounded-xl shadow-2xl animate-in slide-in-from-right duration-300`}>
            <p className="text-xs font-bold text-gray-900">{toast.type === 'error' ? 'Ошибка' : 'Инфо'}</p>
            <p className="text-[11px] text-gray-600">{toast.message}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => { setLessonToEdit(null); setPrefilledSlot(null); setIsFormOpen(true); }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all z-40"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
      </button>

      {isFormOpen && (
        <LessonForm
          initialLesson={lessonToEdit || undefined}
          prefilledSlot={prefilledSlot || undefined}
          onSubmit={handleSaveLesson}
          onCancel={() => { setIsFormOpen(false); setLessonToEdit(null); setPrefilledSlot(null); }}
        />
      )}

      {selectedLesson && (
        <LessonDetailModal
          lesson={selectedLesson}
          onUpdate={handleUpdateLesson}
          onDelete={handleDeleteLesson}
          onMarkCompleted={handleMarkCompleted}
          onEdit={(l) => { setLessonToEdit(l); setIsFormOpen(true); setSelectedLesson(null); }}
          onClose={() => setSelectedLesson(null)}
        />
      )}
    </div>
  );
};

export default App;
