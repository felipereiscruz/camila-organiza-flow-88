import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarDays, Plus, Sparkles, Clock, Dumbbell } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
interface Task {
  id: string;
  text: string;
  completed: boolean;
  date?: string;
  link?: string;
  urgent?: boolean;
}
interface WorkoutPlan {
  id: string;
  name: string;
  schedule: {
    [key: string]: {
      time: string;
      exercises: string;
    } | null;
  };
}
interface CompletedWorkouts {
  [key: string]: boolean; // date string as key, completed as value
}
interface OrganizationData {
  exams: Task[];
  videoLessons: Task[];
  assignments: Task[];
  classes: string;
  meetings: Task[];
  workTasks: Task[];
  workoutPlan: WorkoutPlan | null;
  completedWorkouts: CompletedWorkouts;
  gjMeetings: Task[];
  gjEvents: string;
  outrosEventos: Task[];
}
const DAYS_MAP: {
  [key: string]: number;
} = {
  'Segunda': 1,
  'Terça': 2,
  'Quarta': 3,
  'Quinta': 4,
  'Sexta': 5,
  'Sábado': 6,
  'Domingo': 0
};
const Home = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [data, setData] = useState<OrganizationData>({
    exams: [],
    videoLessons: [],
    assignments: [],
    classes: '',
    meetings: [],
    workTasks: [],
    workoutPlan: null,
    completedWorkouts: {},
    gjMeetings: [],
    gjEvents: '',
    outrosEventos: []
  });

  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('camilaOrganization');
    if (savedData) {
      setData(JSON.parse(savedData));
    }
  }, []);

  // Save data to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('camilaOrganization', JSON.stringify(data));
  }, [data]);

  // Toggle task completion
  const toggleTaskCompletion = (taskId: string, section: keyof Pick<OrganizationData, 'exams' | 'videoLessons' | 'assignments' | 'meetings' | 'workTasks' | 'gjMeetings' | 'outrosEventos'>) => {
    setData(prev => ({
      ...prev,
      [section]: (prev[section] as Task[]).map(task => task.id === taskId ? {
        ...task,
        completed: !task.completed
      } : task)
    }));
  };

  // Check if task is overdue
  const isTaskOverdue = (taskDate?: string) => {
    if (!taskDate) return false;
    const now = new Date();
    const taskDateTime = new Date(taskDate);
    return taskDateTime < now;
  };

  // Get all tasks with dates
  const getTasksForDate = (date: Date) => {
    const tasks: Array<{
      id: string;
      text: string;
      type: string;
      icon: string;
      completed?: boolean;
      date?: string;
      section: string;
      urgent?: boolean;
    }> = [];

    // Check exams
    data.exams.forEach(exam => {
      if (exam.date && isSameDay(parseISO(exam.date), date)) {
        tasks.push({
          id: exam.id,
          text: exam.text,
          type: 'Prova',
          icon: '📚',
          completed: exam.completed,
          date: exam.date,
          section: 'exams',
          urgent: exam.urgent
        });
      }
    });

    // Check assignments
    data.assignments.forEach(assignment => {
      if (assignment.date && isSameDay(parseISO(assignment.date), date)) {
        tasks.push({
          id: assignment.id,
          text: assignment.text,
          type: 'Entrega',
          icon: '📝',
          completed: assignment.completed,
          date: assignment.date,
          section: 'assignments',
          urgent: assignment.urgent
        });
      }
    });

    // Check work meetings
    data.meetings.forEach(meeting => {
      if (meeting.date && isSameDay(parseISO(meeting.date), date)) {
        tasks.push({
          id: meeting.id,
          text: meeting.text,
          type: 'Reunião',
          icon: '💼',
          completed: meeting.completed,
          date: meeting.date,
          section: 'meetings',
          urgent: meeting.urgent
        });
      }
    });

    // Check work tasks
    data.workTasks.forEach(task => {
      if (task.date && isSameDay(parseISO(task.date), date)) {
        tasks.push({
          id: task.id,
          text: task.text,
          type: 'Trabalho',
          icon: '⚡',
          completed: task.completed,
          date: task.date,
          section: 'workTasks',
          urgent: task.urgent
        });
      }
    });

    // Check GJ meetings
    data.gjMeetings.forEach(meeting => {
      if (meeting.date && isSameDay(parseISO(meeting.date), date)) {
        tasks.push({
          id: meeting.id,
          text: meeting.text,
          type: 'GJ',
          icon: '🙌',
          completed: meeting.completed,
          date: meeting.date,
          section: 'gjMeetings',
          urgent: meeting.urgent
        });
      }
    });

    // Check outros eventos
    data.outrosEventos.forEach(evento => {
      if (evento.date && isSameDay(parseISO(evento.date), date)) {
        tasks.push({
          id: evento.id,
          text: evento.text,
          type: 'Outros',
          icon: '📅',
          completed: evento.completed,
          date: evento.date,
          section: 'outrosEventos',
          urgent: evento.urgent
        });
      }
    });

    // Check workouts for this day of week (workouts don't have completion checkboxes)
    const dayName = Object.keys(DAYS_MAP).find(day => DAYS_MAP[day] === date.getDay());
    if (dayName && data.workoutPlan?.schedule[dayName]) {
      const workout = data.workoutPlan.schedule[dayName];
      if (workout) {
        tasks.push({
          id: `workout-${dayName}`,
          text: `${workout.time} - ${workout.exercises}`,
          type: 'Academia',
          icon: '🏋️‍♀️',
          section: 'workout'
        });
      }
    }
    return tasks;
  };

  // Get dates that have events by type
  const getDatesWithEventsByType = () => {
    const datesByType = {
      faculdade: [] as Date[],
      trabalho: [] as Date[],
      academia: [] as Date[],
      gj: [] as Date[],
      outros: [] as Date[]
    };

    // Faculdade (exams and assignments)
    [...data.exams, ...data.assignments].forEach(task => {
      if (task.date) {
        try {
          datesByType.faculdade.push(parseISO(task.date));
        } catch (error) {
          // Invalid date, skip
        }
      }
    });

    // Trabalho (meetings and work tasks)
    [...data.meetings, ...data.workTasks].forEach(task => {
      if (task.date) {
        try {
          datesByType.trabalho.push(parseISO(task.date));
        } catch (error) {
          // Invalid date, skip
        }
      }
    });

    // GJ meetings
    data.gjMeetings.forEach(task => {
      if (task.date) {
        try {
          datesByType.gj.push(parseISO(task.date));
        } catch (error) {
          // Invalid date, skip
        }
      }
    });

    // Outros eventos
    data.outrosEventos.forEach(task => {
      if (task.date) {
        try {
          datesByType.outros.push(parseISO(task.date));
        } catch (error) {
          // Invalid date, skip
        }
      }
    });

    // Academia (workouts)
    if (data.workoutPlan) {
      const today = new Date();
      for (let i = -30; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayName = Object.keys(DAYS_MAP).find(day => DAYS_MAP[day] === date.getDay());
        if (dayName && data.workoutPlan.schedule[dayName]) {
          datesByType.academia.push(date);
        }
      }
    }
    return datesByType;
  };

  // Get dates that have events (legacy function for urgent tasks)
  const getDatesWithEvents = () => {
    const dates: Date[] = [];
    [...data.exams, ...data.assignments, ...data.meetings, ...data.workTasks, ...data.gjMeetings, ...data.outrosEventos].forEach(task => {
      if (task.date) {
        try {
          dates.push(parseISO(task.date));
        } catch (error) {
          // Invalid date, skip
        }
      }
    });
    return dates;
  };

  // Get dates that have urgent tasks
  const getDatesWithUrgentTasks = () => {
    const dates: Date[] = [];
    [...data.exams, ...data.assignments, ...data.meetings, ...data.workTasks, ...data.gjMeetings, ...data.outrosEventos].forEach(task => {
      if (task.date && task.urgent) {
        try {
          dates.push(parseISO(task.date));
        } catch (error) {
          // Invalid date, skip
        }
      }
    });
    return dates;
  };
  const selectedDateTasks = getTasksForDate(selectedDate);
  const datesByType = getDatesWithEventsByType();
  const datesWithEvents = getDatesWithEvents();
  const datesWithUrgentTasks = getDatesWithUrgentTasks();

  // Get workout for selected date
  const getWorkoutForDate = (date: Date) => {
    const dayName = Object.keys(DAYS_MAP).find(day => DAYS_MAP[day] === date.getDay());
    if (dayName && data.workoutPlan?.schedule[dayName]) {
      const workout = data.workoutPlan.schedule[dayName];
      return workout ? `${workout.time} - ${workout.exercises}` : '';
    }
    return '';
  };

  // Toggle workout completion
  const toggleWorkoutCompletion = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    setData(prev => ({
      ...prev,
      completedWorkouts: {
        ...prev.completedWorkouts,
        [dateString]: !prev.completedWorkouts[dateString]
      }
    }));
  };

  // Check if workout is completed for date
  const isWorkoutCompleted = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return data.completedWorkouts[dateString] || false;
  };

  // Count total workouts per week
  const getTotalWorkoutsPerWeek = () => {
    if (!data.workoutPlan) return 0;
    return Object.values(data.workoutPlan.schedule).filter(workout => workout !== null).length;
  };

  // Count completed workouts this week
  const getCompletedWorkoutsThisWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    let completed = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      if (isWorkoutCompleted(date)) {
        completed++;
      }
    }
    return completed;
  };

  // Count overdue tasks
  const getOverdueTasks = () => {
    const now = new Date();
    return [...data.exams, ...data.assignments, ...data.meetings, ...data.workTasks, ...data.gjMeetings, ...data.outrosEventos].filter(task => !task.completed && task.date && new Date(task.date) < now);
  };

  // Count total pending tasks
  const pendingTasks = [...data.exams.filter(t => !t.completed), ...data.assignments.filter(t => !t.completed), ...data.meetings.filter(t => !t.completed), ...data.workTasks.filter(t => !t.completed), ...data.gjMeetings.filter(t => !t.completed), ...data.outrosEventos.filter(t => !t.completed)].length;
  const selectedDateWorkout = getWorkoutForDate(selectedDate);
  const completedWorkoutsThisWeek = getCompletedWorkoutsThisWeek();
  const totalWorkoutsPerWeek = getTotalWorkoutsPerWeek();
  const overdueTasks = getOverdueTasks();
  return <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6 relative">
          <div className="flex items-center justify-center gap-4">
            <div className="flex-1 text-right">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                <Sparkles className="inline w-8 h-8 mr-2 text-primary" />
                Central de Organização da Camila
              </h1>
              <p className="text-muted-foreground mt-2">Seu calendário pessoal ✨</p>
            </div>
            <img src="/lovable-uploads/1aad6b2d-f8d4-48d3-b971-49d9da2665d7.png" alt="Stitch" className="w-20 h-20 object-contain animate-bounce" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="border-2 border-primary/20 shadow-lg lg:col-span-2">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary-glow/10">
              <CardTitle className="flex items-center gap-2 text-primary">
                <CalendarDays className="w-5 h-5" />
                Calendário
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Calendar */}
                <div className="flex-1">
                  <Calendar mode="single" selected={selectedDate} onSelect={date => date && setSelectedDate(date)} className="rounded-md border w-full" locale={ptBR} modifiers={{
                  hasUrgentTask: datesWithUrgentTasks,
                  hasFaculdade: datesByType.faculdade,
                  hasTrabalho: datesByType.trabalho,
                  hasAcademia: datesByType.academia,
                  hasGj: datesByType.gj,
                  hasOutros: datesByType.outros
                }} modifiersClassNames={{
                  hasUrgentTask: "!bg-red-600 !text-white !border-red-600 !border-2",
                  hasFaculdade: "!border-green-500 !border-2",
                  hasTrabalho: "!border-purple-500 !border-2",
                  hasAcademia: "!border-blue-500 !border-2",
                  hasGj: "!border-amber-700 !border-2",
                  hasOutros: "!border-gray-500 !border-2"
                }} />
                </div>
                
                {/* Legend - responsive: right side on large screens, bottom on small screens */}
                <div className="w-full lg:w-64 lg:flex-shrink-0">
                  <h4 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 border border-gray-400 rounded"></div>
                    Legenda do Calendário
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border border-green-500 rounded flex-shrink-0"></div>
                      <span>📚 Faculdade</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border border-purple-500 rounded flex-shrink-0"></div>
                      <span>💼 Trabalho</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border border-blue-500 rounded flex-shrink-0"></div>
                      <span>🏋️‍♀️ Academia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border border-amber-700 rounded flex-shrink-0"></div>
                      <span>🙌 GJ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border border-gray-500 rounded flex-shrink-0"></div>
                      <span>📅 Outros Eventos</span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1 pt-2 border-t border-border/20">
                      <div className="w-3 h-3 bg-red-600 rounded flex-shrink-0"></div>
                      <span className="text-red-600 font-medium">⚠️ Urgente</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Events - moved to sidebar */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary-glow/10">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Clock className="w-5 h-5" />
                {format(selectedDate, "EEEE, d 'de' MMMM", {
                locale: ptBR
              })}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {selectedDateTasks.length > 0 ? <div className="space-y-3">
                  {selectedDateTasks.map((task, index) => {
                const isOverdue = isTaskOverdue(task.date);
                const cardClass = task.completed ? 'bg-green-100 border-green-300' : isOverdue && task.section !== 'workout' ? 'bg-red-100 border-red-300' : 'bg-secondary/50 border-border';
                return <div key={index} className={`flex items-center gap-3 p-3 rounded-lg border ${cardClass}`}>
                        {task.section !== 'workout' && <Checkbox checked={task.completed || false} onCheckedChange={() => toggleTaskCompletion(task.id, task.section as any)} className="mt-1" />}
                        <span className="text-lg">{task.icon}</span>
                        <div className="flex-1">
                           <Badge variant="outline" className={`mb-1 text-xs ${task.completed ? 'border-green-500 text-green-700' : isOverdue && task.section !== 'workout' ? 'border-red-500 text-red-700' : ''}`}>
                             {task.type}
                           </Badge>
                           <p className={`text-sm ${task.completed ? 'line-through text-green-600' : isOverdue && task.section !== 'workout' ? 'text-red-700 font-medium' : ''}`}>
                             {task.text}
                             {task.urgent && <Badge variant="destructive" className="ml-2 text-xs">
                                 Tarefa Urgente
                               </Badge>}
                           </p>
                         </div>
                      </div>;
              })}
                </div> : <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum compromisso para este dia</p>
                  <p className="text-xs mt-1">Que tal aproveitar para relaxar caozin? 😌</p>
                </div>}
            </CardContent>
          </Card>
        </div>


        {/* Overdue Tasks Alert or Success Message */}
        {overdueTasks.length > 0 ? <Card className="border-2 border-primary/20 shadow-lg">
            <CardContent className="p-4 bg-gradient-to-r from-primary/10 to-primary-glow/10">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-600 mb-1">
                    ⚠️ {overdueTasks.length} tarefa{overdueTasks.length > 1 ? 's' : ''} atrasada{overdueTasks.length > 1 ? 's' : ''}
                  </h3>
                  <p className="text-red-500 text-xs">
                    Caozin, você está com tarefas atrasadas, compromisso cara...
                  </p>
                </div>
                <img src="/lovable-uploads/65d46097-e63d-4ef8-88b8-cd7edf624010.png" alt="Stitch preocupado" className="w-12 h-12 object-contain" />
              </div>
            </CardContent>
          </Card> : pendingTasks > 0 ? <Card className="border-2 border-primary/20 shadow-lg">
            <CardContent className="p-4 bg-gradient-to-r from-primary/10 to-primary-glow/10">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-green-600 mb-1">
                    ✅ Você está em dia!
                  </h3>
                  <p className="text-green-500 text-xs">
                    Parabéns! Continue assim!
                  </p>
                </div>
                <img src="/lovable-uploads/1ebadb55-1053-4b5c-9119-607884f56e3f.png" alt="Stitch feliz" className="w-12 h-12 object-contain" />
              </div>
            </CardContent>
          </Card> : null}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Tarefas Pendentes</p>
              <p className="text-2xl font-bold text-primary">{pendingTasks}</p>
            </CardContent>
          </Card>
          
          <Card className="border-primary/20">
            <CardContent className="p-4 text-center">
              <CalendarDays className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Eventos Agendados</p>
              <p className="text-2xl font-bold text-primary">{[...data.gjMeetings, ...data.outrosEventos].filter(task => task.date).length}</p>
            </CardContent>
          </Card>

          <Card className="border-secondary/40">
            <CardContent className="p-4 text-center">
              <Dumbbell className="w-6 h-6 mx-auto mb-2 text-secondary-foreground" />
              <p className="text-sm text-muted-foreground">Treino do dia</p>
              <div className="min-h-[2rem] flex items-center justify-center">
                {selectedDateWorkout ? <div className="text-center">
                    <p className="text-sm font-medium text-secondary-foreground">
                      {selectedDateWorkout}
                    </p>
                    <button onClick={() => toggleWorkoutCompletion(selectedDate)} className={`mt-2 text-xs px-2 py-1 rounded ${isWorkoutCompleted(selectedDate) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {isWorkoutCompleted(selectedDate) ? '✓ Concluído' : 'Marcar como feito'}
                    </button>
                  </div> : <p className="text-xs text-muted-foreground">Sem treino</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/20">
            <CardContent className="p-4 text-center">
              <Dumbbell className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-muted-foreground">Treinos finalizados</p>
              <p className="text-2xl font-bold text-green-600">
                {completedWorkoutsThisWeek}/{totalWorkoutsPerWeek}
              </p>
              <p className="text-xs text-muted-foreground mt-1">esta semana</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Commitments Button */}
        <div className="text-center">
          <Link to="/organizar">
            <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 text-white shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Compromissos
            </Button>
          </Link>
          <p className="text-muted-foreground text-sm mt-2">Desenvolvido pelo Felipe Reis</p>
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-muted-foreground text-sm">
          <p>💾 Todos os dados são salvos automaticamente no seu navegador</p>
        </div>
      </div>
    </div>;
};
export default Home;