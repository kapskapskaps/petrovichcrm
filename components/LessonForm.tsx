
import React, { useState, useEffect } from 'react';
import { Lesson, ScheduleSlot, DAYS, DayOfWeek } from '../types';

interface LessonFormProps {
  initialLesson?: Lesson;
  prefilledSlot?: ScheduleSlot;
  onSubmit: (lesson: Lesson) => void;
  onCancel: () => void;
}

const LessonForm: React.FC<LessonFormProps> = ({ initialLesson, prefilledSlot, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Lesson>>(
    initialLesson || {
      studentName: '',
      parentName: '',
      studentContact: '',
      parentContact: '',
      lessonNumber: 1,
      course: '',
      frequency: 1,
      slots: prefilledSlot ? [prefilledSlot] : [{ dayOfWeek: 'Monday', time: '10:00' }],
    }
  );

  // Sync state if prefilledSlot changes or form is re-opened
  useEffect(() => {
    if (!initialLesson && prefilledSlot) {
        setFormData(prev => ({
            ...prev,
            slots: [prefilledSlot]
        }));
    }
  }, [prefilledSlot, initialLesson]);

  const handleFrequencyChange = (freq: number) => {
    const newSlots = [...(formData.slots || [])];
    if (freq > newSlots.length) {
      for (let i = newSlots.length; i < freq; i++) {
        newSlots.push({ dayOfWeek: 'Monday', time: '10:00' });
      }
    } else {
      newSlots.splice(freq);
    }
    setFormData({ ...formData, frequency: freq, slots: newSlots });
  };

  const handleSlotChange = (index: number, field: keyof ScheduleSlot, value: string) => {
    const newSlots = [...(formData.slots || [])];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setFormData({ ...formData, slots: newSlots });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: formData.id || Math.random().toString(36).substr(2, 9),
    } as Lesson);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-indigo-600 p-6">
          <h2 className="text-2xl font-bold text-white">
            {initialLesson ? 'Редактировать урок' : 'Создать урок'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Имя ученика</label>
              <input
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={formData.studentName}
                onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                placeholder="Иван Иванов"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Имя родителя</label>
              <input
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={formData.parentName}
                onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                placeholder="Мария Иванова"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Контакты ученика</label>
              <input
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={formData.studentContact}
                onChange={e => setFormData({ ...formData, studentContact: e.target.value })}
                placeholder="+7 (999) 000-00-00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Контакты родителя</label>
              <input
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={formData.parentContact}
                onChange={e => setFormData({ ...formData, parentContact: e.target.value })}
                placeholder="+7 (999) 111-11-11"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Номер занятия</label>
              <input
                type="number"
                min="1"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={formData.lessonNumber}
                onChange={e => setFormData({ ...formData, lessonNumber: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Курс / Предмет</label>
              <input
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={formData.course}
                onChange={e => setFormData({ ...formData, course: e.target.value })}
                placeholder="Математика ЕГЭ"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Раз в неделю</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={formData.frequency}
                onChange={e => handleFrequencyChange(parseInt(e.target.value))}
              >
                <option value={1}>1 раз</option>
                <option value={2}>2 раза</option>
                <option value={3}>3 раза</option>
                <option value={4}>4 раза</option>
                <option value={5}>5 раз</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-gray-800">Расписание</h3>
            {formData.slots?.map((slot, index) => (
              <div key={index} className="flex gap-4 items-center animate-in slide-in-from-left-2 duration-150">
                <div className="flex-1">
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 transition"
                    value={slot.dayOfWeek}
                    onChange={e => handleSlotChange(index, 'dayOfWeek', e.target.value)}
                  >
                    {DAYS.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <input
                    type="time"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 transition"
                    value={slot.time}
                    onChange={e => handleSlotChange(index, 'time', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LessonForm;
