import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Trash2, Plus } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  date?: Date;
  time?: string;
  link?: string;
  urgent?: boolean;
}

type TaskSection = 'exams' | 'videoLessons' | 'assignments' | 'meetings' | 'workTasks' | 'gjMeetings' | 'outrosEventos';

interface TaskListProps {
  tasks: Task[];
  section: TaskSection;
  showLink?: boolean;
  showDate?: boolean;
  placeholder?: string;
  onUpdateTask: (section: TaskSection, id: string, updates: Partial<Task>) => void;
  onRemoveTask: (section: TaskSection, id: string) => void;
  onAddTask: (section: TaskSection) => void;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  section, 
  showLink = false, 
  showDate = false,
  placeholder = "Digite aqui...",
  onUpdateTask,
  onRemoveTask,
  onAddTask
}) => {
  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <div key={task.id} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg border border-border">
          <div className="flex-1 space-y-2">
            <Input
              value={task.text}
              onChange={(e) => onUpdateTask(section, task.id, { text: e.target.value })}
              placeholder={placeholder}
              className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
            />
            {showDate && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal text-xs",
                          !task.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {task.date ? format(task.date, "dd/MM/yyyy") : <span>Data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={task.date}
                        onSelect={(date) => onUpdateTask(section, task.id, { date })}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={task.time || ''}
                    onChange={(e) => onUpdateTask(section, task.id, { time: e.target.value })}
                    className="text-xs"
                    placeholder="Hora"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`urgent-${task.id}`}
                    checked={task.urgent || false}
                    onCheckedChange={(checked) => onUpdateTask(section, task.id, { urgent: !!checked })}
                  />
                  <label
                    htmlFor={`urgent-${task.id}`}
                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Tarefa Urgente
                  </label>
                </div>
              </div>
            )}
            {showLink && (
              <Input
                value={task.link || ''}
                onChange={(e) => onUpdateTask(section, task.id, { link: e.target.value })}
                placeholder="Link da videoaula (opcional)"
                className="text-xs"
              />
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveTask(section, task.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button 
        onClick={() => onAddTask(section)}
        variant="outline"
        className="w-full border-dashed"
      >
        <Plus className="w-4 h-4 mr-2" />
        Adicionar
      </Button>
    </div>
  );
};

export default TaskList;