import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import TaskList from '@/components/TaskList';
import { BookOpen, Briefcase, Dumbbell, Heart, Trash2, Plus, Calendar, Clock, CheckSquare, Home, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
interface Task {
  id: string;
  text: string;
  date?: Date;
  time?: string;
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
interface OrganizationData {
  exams: Task[];
  videoLessons: Task[];
  assignments: Task[];
  classes: string;
  meetings: Task[];
  workTasks: Task[];
  workoutPlan: WorkoutPlan | null;
  gjMeetings: Task[];
  gjEvents: string;
  outrosEventos: Task[];
}
const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const OrganizationApp = () => {
  const [data, setData] = useState<OrganizationData>({
    exams: [],
    videoLessons: [],
    assignments: [],
    classes: '',
    meetings: [],
    workTasks: [],
    workoutPlan: null,
    gjMeetings: [],
    gjEvents: '',
    outrosEventos: []
  });
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [workoutForm, setWorkoutForm] = useState({
    name: '',
    schedule: DAYS.reduce((acc, day) => ({
      ...acc,
      [day]: {
        time: '',
        exercises: ''
      }
    }), {} as {
      [key: string]: {
        time: string;
        exercises: string;
      };
    })
  });

  // Section expansion states
  const [expandedSections, setExpandedSections] = useState({
    faculdade: true,
    trabalho: true,
    academia: true,
    gj: true,
    outros: true
  });
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('camilaOrganization');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // Convert date strings back to Date objects
      const convertDates = (tasks: any[]) => tasks.map(task => ({
        ...task,
        date: task.date ? new Date(task.date) : undefined,
        urgent: task.urgent || false
      }));
      setData({
        ...parsedData,
        exams: convertDates(parsedData.exams || []),
        videoLessons: convertDates(parsedData.videoLessons || []),
        assignments: convertDates(parsedData.assignments || []),
        meetings: convertDates(parsedData.meetings || []),
        workTasks: convertDates(parsedData.workTasks || []),
        gjMeetings: convertDates(parsedData.gjMeetings || []),
        outrosEventos: convertDates(parsedData.outrosEventos || [])
      });
    }
  }, []);

  // Save data to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('camilaOrganization', JSON.stringify(data));
  }, [data]);
  const addTask = (section: keyof Pick<OrganizationData, 'exams' | 'videoLessons' | 'assignments' | 'meetings' | 'workTasks' | 'gjMeetings' | 'outrosEventos'>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text: ''
    };
    setData(prev => ({
      ...prev,
      [section]: [...prev[section], newTask]
    }));
  };
  const updateTask = (section: keyof Pick<OrganizationData, 'exams' | 'videoLessons' | 'assignments' | 'meetings' | 'workTasks' | 'gjMeetings' | 'outrosEventos'>, id: string, updates: Partial<Task>) => {
    setData(prev => ({
      ...prev,
      [section]: prev[section].map(task => task.id === id ? {
        ...task,
        ...updates
      } : task)
    }));
  };
  const removeTask = (section: keyof Pick<OrganizationData, 'exams' | 'videoLessons' | 'assignments' | 'meetings' | 'workTasks' | 'gjMeetings' | 'outrosEventos'>, id: string) => {
    setData(prev => ({
      ...prev,
      [section]: prev[section].filter(task => task.id !== id)
    }));
  };
  const clearSection = (section: keyof OrganizationData) => {
    setData(prev => ({
      ...prev,
      [section]: section === 'workoutPlan' ? null : section === 'classes' || section === 'gjEvents' ? '' : []
    }));
  };
  const saveWorkoutPlan = () => {
    const newPlan: WorkoutPlan = {
      id: Date.now().toString(),
      name: workoutForm.name || 'Meu Treino',
      schedule: Object.entries(workoutForm.schedule).reduce((acc, [day, data]) => ({
        ...acc,
        [day]: data.time || data.exercises ? {
          time: data.time,
          exercises: data.exercises
        } : null
      }), {})
    };
    setData(prev => ({
      ...prev,
      workoutPlan: newPlan
    }));
    setShowWorkoutForm(false);
    setWorkoutForm({
      name: '',
      schedule: DAYS.reduce((acc, day) => ({
        ...acc,
        [day]: {
          time: '',
          exercises: ''
        }
      }), {} as {
        [key: string]: {
          time: string;
          exercises: string;
        };
      })
    });
  };
  const editWorkoutPlan = () => {
    if (!data.workoutPlan) return;
    const scheduleData = DAYS.reduce((acc, day) => {
      const existingData = data.workoutPlan?.schedule[day];
      return {
        ...acc,
        [day]: {
          time: existingData?.time || '',
          exercises: existingData?.exercises || ''
        }
      };
    }, {} as {
      [key: string]: {
        time: string;
        exercises: string;
      };
    });
    setWorkoutForm({
      name: data.workoutPlan.name,
      schedule: scheduleData
    });
    setShowWorkoutForm(true);
  };
  return <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between py-6">
          <Link to="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Calendário
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Adicionar Compromissos
            </h1>
            <p className="text-muted-foreground text-sm">Organize sua vida aqui ✨</p>
          </div>
          <div className="w-[140px]"></div> {/* Spacer for balance */}
        </div>

        {/* Faculdade Section */}
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary-glow/10 cursor-pointer hover:bg-primary/15 transition-colors" onClick={() => toggleSection('faculdade')}>
            <CardTitle className="flex items-center justify-between text-primary">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                📚 Faculdade
              </div>
              {expandedSections.faculdade ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </CardTitle>
          </CardHeader>
          {expandedSections.faculdade && <CardContent className="space-y-6 p-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Horários de Provas
              </h3>
              <TaskList tasks={data.exams} section="exams" showDate placeholder="Ex: Matemática - Prova Final" onUpdateTask={updateTask} onRemoveTask={removeTask} onAddTask={addTask} />
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Vídeo-aulas para Assistir
              </h3>
              <TaskList tasks={data.videoLessons} section="videoLessons" showLink placeholder="Ex: Aula de Cálculo - Derivadas" onUpdateTask={updateTask} onRemoveTask={removeTask} onAddTask={addTask} />
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Atividades para Entregar
              </h3>
              <TaskList tasks={data.assignments} section="assignments" showDate placeholder="Ex: Trabalho de História - Revolução Industrial" onUpdateTask={updateTask} onRemoveTask={removeTask} onAddTask={addTask} />
            </div>

            

            <Button onClick={() => clearSection('exams')} variant="destructive" size="sm" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Seção Faculdade
            </Button>
          </CardContent>}
        </Card>

        {/* Trabalho Section */}
        <Card className="border-2 border-accent/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5 cursor-pointer hover:bg-accent/15 transition-colors" onClick={() => toggleSection('trabalho')}>
            <CardTitle className="flex items-center justify-between text-accent-foreground">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                💼 Trabalho
              </div>
              {expandedSections.trabalho ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </CardTitle>
          </CardHeader>
          {expandedSections.trabalho && <CardContent className="space-y-6 p-6">
            <div>
              <h3 className="font-semibold mb-3">Reuniões e Tarefas</h3>
              <TaskList tasks={data.meetings} section="meetings" showDate placeholder="Ex: Reunião de equipe" onUpdateTask={updateTask} onRemoveTask={removeTask} onAddTask={addTask} />
            </div>


            <Button onClick={() => clearSection('meetings')} variant="destructive" size="sm" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Seção Trabalho
            </Button>
          </CardContent>}
        </Card>

        {/* Academia Section */}
        <Card className="border-2 border-secondary/40 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-secondary/20 to-secondary/10 cursor-pointer hover:bg-secondary/25 transition-colors" onClick={() => toggleSection('academia')}>
            <CardTitle className="flex items-center justify-between text-secondary-foreground">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                🏋️‍♀️ Academia
              </div>
              {expandedSections.academia ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </CardTitle>
          </CardHeader>
          {expandedSections.academia && <CardContent className="space-y-4 p-6">
            {!data.workoutPlan && !showWorkoutForm && <div className="text-center py-8">
                <Dumbbell className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <Button onClick={() => setShowWorkoutForm(true)} variant="outline" className="border-dashed">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Treino
                </Button>
              </div>}

            {showWorkoutForm && <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nome do Plano de Treino</label>
                  <Input value={workoutForm.name} onChange={e => setWorkoutForm(prev => ({
                ...prev,
                name: e.target.value
              }))} placeholder="Ex: Treino de Força" className="mb-4" />
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Horários da Semana</h4>
                  {DAYS.map(day => <div key={day} className="space-y-2 p-3 border rounded-lg">
                      <label className="text-sm font-medium">{day}</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="time" value={workoutForm.schedule[day].time} onChange={e => setWorkoutForm(prev => ({
                    ...prev,
                    schedule: {
                      ...prev.schedule,
                      [day]: {
                        ...prev.schedule[day],
                        time: e.target.value
                      }
                    }
                  }))} placeholder="Horário" />
                        <Input value={workoutForm.schedule[day].exercises} onChange={e => setWorkoutForm(prev => ({
                    ...prev,
                    schedule: {
                      ...prev.schedule,
                      [day]: {
                        ...prev.schedule[day],
                        exercises: e.target.value
                      }
                    }
                  }))} placeholder="Ex: Treino de pernas" />
                      </div>
                    </div>)}
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveWorkoutPlan} className="flex-1">
                    Salvar Plano
                  </Button>
                  <Button variant="outline" onClick={() => setShowWorkoutForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>}

            {data.workoutPlan && !showWorkoutForm && <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{data.workoutPlan.name}</h3>
                  <Button variant="outline" size="sm" onClick={editWorkoutPlan}>
                    Editar
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {DAYS.map(day => {
                const daySchedule = data.workoutPlan?.schedule[day];
                if (!daySchedule) return null;
                return <div key={day} className="flex items-center gap-3 p-2 bg-secondary/30 rounded">
                        <span className="w-20 text-sm font-medium">{day}:</span>
                        <span className="text-sm">{daySchedule.time}</span>
                        <span className="text-sm text-muted-foreground">-</span>
                        <span className="text-sm">{daySchedule.exercises}</span>
                      </div>;
              })}
                </div>

                <Button onClick={() => clearSection('workoutPlan')} variant="destructive" size="sm" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover Plano de Treino
                </Button>
              </div>}
          </CardContent>}
        </Card>

        {/* GJ Section */}
        <Card className="border-2 border-muted/40 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-muted/20 to-muted/10 cursor-pointer hover:bg-muted/25 transition-colors" onClick={() => toggleSection('gj')}>
            <CardTitle className="flex items-center justify-between text-muted-foreground">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                🙌 GJ
              </div>
              {expandedSections.gj ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </CardTitle>
          </CardHeader>
          {expandedSections.gj && <CardContent className="space-y-6 p-6">
            <div>
              <h3 className="font-semibold mb-3">Encontros e Eventos</h3>
              <TaskList tasks={data.gjMeetings} section="gjMeetings" showDate placeholder="Ex: Reunião de jovens" onUpdateTask={updateTask} onRemoveTask={removeTask} onAddTask={addTask} />
            </div>

            <Button onClick={() => clearSection('gjMeetings')} variant="destructive" size="sm" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Seção GJ
            </Button>
          </CardContent>}
        </Card>

        {/* Outros Eventos Section */}
        <Card className="border-2 border-muted/40 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-muted/20 to-muted/10 cursor-pointer hover:bg-muted/25 transition-colors" onClick={() => toggleSection('outros')}>
            <CardTitle className="flex items-center justify-between text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                📅 Outros Eventos
              </div>
              {expandedSections.outros ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </CardTitle>
          </CardHeader>
          {expandedSections.outros && <CardContent className="space-y-6 p-6">
            <div>
              <h3 className="font-semibold mb-3">Eventos Diversos</h3>
              <TaskList tasks={data.outrosEventos} section="outrosEventos" showDate placeholder="Ex: Aniversário da Maria" onUpdateTask={updateTask} onRemoveTask={removeTask} onAddTask={addTask} />
            </div>

            <Button onClick={() => clearSection('outrosEventos')} variant="destructive" size="sm" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Outros Eventos
            </Button>
          </CardContent>}
        </Card>

        {/* Footer */}
        <div className="text-center py-6 text-muted-foreground text-sm">
          <p>💾 Todos os dados são salvos automaticamente no seu navegador</p>
        </div>
      </div>
    </div>;
};
export default OrganizationApp;