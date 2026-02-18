
import React, { useState, useEffect } from 'react';
import { Lesson, LessonInstance, DAYS, HOURS, DayOfWeek, ScheduleSlot } from './types';
import LessonForm from './components/LessonForm';
import LessonDetailModal from './components/LessonDetailModal';

const App: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem('tutor_lessons');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [lessonToEdit, setLessonToEdit] = useState<Lesson | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonInstance | null>(null);
  
  // State for navigating weeks
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    localStorage.setItem('tutor_lessons', JSON.stringify(lessons));
  }, [lessons]);

  // Helper to get the start of the week (Monday) for a given date
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(viewDate);

  const goToPreviousWeek = () => {
    const prev = new Date(viewDate);
    prev.setDate(prev.getDate() - 7);
    setViewDate(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(viewDate);
    next.setDate(next.getDate() + 7);
    setViewDate(next);
  };

  const goToToday = () => {
    setViewDate(new Date());
  };

  const formatDateRange = () => {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return `${startOfWeek.toLocaleDateString('ru-RU', options)} — ${endOfWeek.toLocaleDateString('ru-RU', options)}`;
  };

  const getDayDate = (index: number) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + index);
    return d.getDate();
  };

  const handleSaveLesson = (lesson: Lesson) => {
    if (lessonToEdit) {
      setLessons(lessons.map(l => l.id === lesson.id ? lesson : l));
    } else {
      setLessons([...lessons, lesson]);
    }
    setIsFormOpen(false);
    setLessonToEdit(null);
  };

  const handleUpdateLesson = (updatedLesson: Lesson) => {
    setLessons(lessons.map(l => l.id === updatedLesson.id ? updatedLesson : l));
  };

  const handleDeleteLesson = (id: string, onlyThisDay: boolean) => {
    if (onlyThisDay && selectedLesson) {
      const lesson = lessons.find(l => l.id === id);
      if (lesson) {
        const newSlots = lesson.slots.filter(s => 
          !(s.dayOfWeek === selectedLesson.currentSlot.dayOfWeek && s.time === selectedLesson.currentSlot.time)
        );
        if (newSlots.length === 0) {
          setLessons(lessons.filter(l => l.id !== id));
        } else {
          setLessons(lessons.map(l => l.id === id ? { ...l, slots: newSlots, frequency: newSlots.length } : l));
        }
      }
    } else {
      setLessons(lessons.filter(l => l.id !== id));
    }
    setSelectedLesson(null);
  };

  const handleMarkCompleted = (id: string) => {
    setLessons(lessons.map(l => l.id === id ? { ...l, lessonNumber: l.lessonNumber + 1 } : l));
    setSelectedLesson(null);
  };

  const handleEditTrigger = (lesson: Lesson) => {
    setSelectedLesson(null);
    setLessonToEdit(lesson);
    setIsFormOpen(true);
  };

  const renderLessonsForSlot = (day: DayOfWeek, hour: string) => {
    return lessons.flatMap(lesson => 
      lesson.slots
        .filter(slot => slot.dayOfWeek === day && slot.time.startsWith(hour.split(':')[0].padStart(2, '0')))
        .map(slot => (
          <div
            key={`${lesson.id}-${slot.dayOfWeek}-${slot.time}`}
            onClick={() => setSelectedLesson({ ...lesson, currentSlot: slot, instanceDescription: lesson.description })}
            className="absolute inset-x-1 top-1 bg-indigo-100 border-l-4 border-indigo-600 p-2 rounded-lg cursor-pointer hover:bg-indigo-200 transition shadow-sm group overflow-hidden"
            style={{ height: 'calc(100% - 8px)' }}
          >
            <div className="font-bold text-indigo-900 text-xs truncate">{lesson.studentName}</div>
            <div className="text-[10px] text-indigo-700 truncate">{lesson.course}</div>
            <div className="text-[9px] text-indigo-500 mt-1 opacity-0 group-hover:opacity-100 transition">№{lesson.lessonNumber}</div>
          </div>
        ))
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            TutorMaster CRM
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center bg-gray-100 rounded-xl p-1 shadow-inner">
            <button 
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600"
              title="Предыдущая неделя"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button 
              onClick={goToToday}
              className="px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all mx-1"
            >
              Сегодня
            </button>
            <button 
              onClick={goToNextWeek}
              className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600"
              title="Следующая неделя"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
          <div className="text-sm font-bold text-indigo-900 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
            {formatDateRange()}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
            <img src="https://picsum.photos/32/32" alt="Avatar" />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 flex flex-col">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 flex-1 overflow-hidden flex flex-col">
          <div className="calendar-grid border-b bg-gray-50/50">
            <div className="p-4"></div>
            {DAYS.map((day, index) => {
              const dateNum = getDayDate(index);
              const isToday = new Date().toDateString() === new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + index)).toDateString();
              return (
                <div key={day} className={`p-4 text-center border-l first:border-l-0 ${isToday ? 'bg-indigo-50/50' : ''}`}>
                  <span className={`block text-xs font-bold uppercase tracking-wider ${isToday ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {day.substring(0, 3)}
                  </span>
                  <span className={`inline-flex items-center justify-center w-8 h-8 mt-1 rounded-full text-lg font-bold ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-800'}`}>
                    {dateNum}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar relative">
            <div className="calendar-grid min-h-full">
              <div className="flex flex-col">
                {HOURS.map(hour => (
                  <div key={hour} className="h-20 border-b p-2 text-[11px] font-medium text-gray-400 text-right pr-4">
                    {hour}
                  </div>
                ))}
              </div>

              {DAYS.map(day => (
                <div key={day} className="border-l relative group">
                  {HOURS.map(hour => (
                    <div key={`${day}-${hour}`} className="h-20 border-b relative">
                      {renderLessonsForSlot(day, hour)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <button
        onClick={() => { setLessonToEdit(null); setIsFormOpen(true); }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <svg className="w-8 h-8 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
        </svg>
      </button>

      {isFormOpen && (
        <LessonForm
          initialLesson={lessonToEdit || undefined}
          onSubmit={handleSaveLesson}
          onCancel={() => { setIsFormOpen(false); setLessonToEdit(null); }}
        />
      )}

      {selectedLesson && (
        <LessonDetailModal
          lesson={selectedLesson}
          onUpdate={handleUpdateLesson}
          onDelete={handleDeleteLesson}
          onMarkCompleted={handleMarkCompleted}
          onEdit={handleEditTrigger}
          onClose={() => setSelectedLesson(null)}
        />
      )}
    </div>
  );
};

export default App;
