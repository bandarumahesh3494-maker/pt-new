// import { Task } from '../../lib/supabase';
import { CheckCircle2, Circle, AlertCircle, Clock } from 'lucide-react';

interface StatsCardsProps {
  tasks: any[];
}

export function StatsCards({ tasks }: StatsCardsProps) {
  console.log('tasks in StatsCards:', tasks);
  const totalTasks = tasks?.length;
  const inProgressTasks = tasks?.filter(t => t.status === 'in-progress').length;
  const completedTasks = tasks?.filter(t => t.status === 'completed').length;
  const assignedTasks = tasks?.filter(t => t.status === 'assigned').length;

  const stats = [
    {
      label: 'Assigned Tasks',
      value: assignedTasks,
      icon: Circle,
      gradient: 'from-pink-500 to-pink-600',
      iconColor: 'text-pink-100'
    },
    {
      label: 'In Progress',
      value: inProgressTasks,
      icon: Clock,
      gradient: 'from-teal-500 to-teal-600',
      iconColor: 'text-teal-100'
    },
    {
      label: 'Completed',
      value: completedTasks,
      icon: CheckCircle2,
      gradient: 'from-amber-500 to-amber-600',
      iconColor: 'text-amber-100'
    },
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: AlertCircle,
      gradient: 'from-blue-500 to-blue-600',
      iconColor: 'text-blue-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${stat.gradient} p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">{stat.label}</p>
              <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
            </div>
            <div className={`${stat.iconColor} opacity-80`}>
              <stat.icon size={40} />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <stat.icon size={100} />
          </div>
        </div>
      ))}
    </div>
  );
}
