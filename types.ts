
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface ScheduleSlot {
  dayOfWeek: DayOfWeek;
  time: string; // HH:mm format
}

export interface Lesson {
  id: string;
  studentName: string;
  parentName: string;
  studentContact: string;
  parentContact: string;
  lessonNumber: number;
  course: string;
  frequency: number;
  slots: ScheduleSlot[];
  description?: string;
}

export interface LessonInstance extends Lesson {
  currentSlot: ScheduleSlot;
  instanceDescription?: string; // Notes for a specific session
}

export const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const HOURS = Array.from({ length: 15 }, (_, i) => `${i + 8}:00`); // 8 AM to 10 PM
