
import React, { useState } from 'react';
import { Lesson, LessonInstance } from '../types';
import { generateStudentSummary } from '../services/geminiService';

interface LessonDetailModalProps {
  lesson: LessonInstance;
  onUpdate: (lesson: Lesson) => void;
  onDelete: (id: string, onlyThisDay: boolean) => void;
  onMarkCompleted: (id: string) => void;
  onEdit: (lesson: Lesson) => void;
  onClose: () => void;
}

const LessonDetailModal: React.FC<LessonDetailModalProps> = ({ lesson, onUpdate, onDelete, onMarkCompleted, onEdit, onClose }) => {
  const [notes, setNotes] = useState(lesson.instanceDescription || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  const handleSaveNotes = () => {
    onUpdate({ ...lesson, description: notes });
    onClose();
  };

  const handleGetAiSummary = async () => {
    setIsGenerating(true);
    const summary = await generateStudentSummary(lesson.studentName, [notes]);
    setAiSummary(summary);
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-2xl font-bold">{lesson.studentName}</h2>
            <p className="opacity-90">{lesson.course} - Занятие №{lesson.lessonNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onEdit(lesson)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              title="Редактировать"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="block text-gray-500 font-medium text-[10px] uppercase tracking-wider mb-1">Родитель</span>
              <span className="text-gray-900 font-medium">{lesson.parentName || 'Не указано'}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="block text-gray-500 font-medium text-[10px] uppercase tracking-wider mb-1">Контакт ученика</span>
              <span className="text-gray-900 font-medium">{lesson.studentContact || 'Не указано'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Заметки к уроку</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 h-32 resize-none transition"
              placeholder="Что проходили, домашнее задание..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {aiSummary && (
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 text-sm animate-in fade-in duration-300">
              <div className="font-bold mb-1 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
                AI Анализ
              </div>
              {aiSummary}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-4">
            <button
              onClick={handleGetAiSummary}
              disabled={isGenerating || !notes}
              className="flex-1 min-w-[140px] px-4 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-medium hover:from-violet-600 hover:to-indigo-700 disabled:opacity-50 transition shadow-md shadow-indigo-100"
            >
              {isGenerating ? 'Думаю...' : 'AI Анализ'}
            </button>
            <button
              onClick={() => onMarkCompleted(lesson.id)}
              className="flex-1 min-w-[140px] px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition shadow-md shadow-emerald-100"
            >
              Завершить урок
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onDelete(lesson.id, true)}
              className="flex-1 px-4 py-2 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-50 transition"
            >
              Удалить сегодня
            </button>
            <button
              onClick={() => onDelete(lesson.id, false)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition shadow-lg shadow-red-100"
            >
              Удалить курс
            </button>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-gray-100">
             <button
              onClick={handleSaveNotes}
              className="px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition"
            >
              Сохранить заметки
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonDetailModal;
