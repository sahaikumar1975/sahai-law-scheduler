import React from 'react';
import { getTrafficLightStatus, getDaysRemaining } from '@/lib/utils';
import { Calendar, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export type TaskType = 'meeting' | 'diligence' | 'drafting';

interface TaskCardProps {
  type: TaskType;
  clientName: string;
  deadline?: Date;
  details?: string;
  status?: string;
  feeStatus?: string;
  priority?: string;
  reminderSet?: boolean;
  onToggleReminder?: () => void;
}

export default function TaskCard({
  type,
  clientName,
  deadline,
  details,
  status,
  feeStatus,
  priority,
  reminderSet,
  onToggleReminder,
}: TaskCardProps) {
  let trafficLight = 'green';
  let daysRemaining = 0;

  if (deadline) {
    trafficLight = getTrafficLightStatus(deadline);
    daysRemaining = getDaysRemaining(deadline);
  }

  const getLightColor = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-500 shadow-red-500/50';
      case 'yellow':
        return 'bg-amber-400 shadow-amber-400/50';
      case 'green':
      default:
        return 'bg-emerald-500 shadow-emerald-500/50';
    }
  };

  return (
    <div className="flex flex-col p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          {type === 'meeting' && <Calendar className="w-5 h-5 text-slate-500" />}
          {type === 'diligence' && <FileText className="w-5 h-5 text-slate-500" />}
          {type === 'drafting' && <Clock className="w-5 h-5 text-slate-500" />}
          <h3 className="font-semibold text-slate-900">{clientName}</h3>
        </div>
        {deadline && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-500">
              {daysRemaining < 0 ? 'Overdue' : `${daysRemaining} days left`}
            </span>
            <div className={`w-3 h-3 rounded-full shadow-sm ${getLightColor(trafficLight)}`} />
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm text-slate-600 flex-grow">
        {details && <p className="line-clamp-2">{details}</p>}
        
        {type === 'diligence' && (
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
              {status}
            </span>
            <span className={`text-xs font-medium ${feeStatus === 'Paid' ? 'text-emerald-600' : 'text-rose-600'}`}>
              Fee: {feeStatus}
            </span>
          </div>
        )}

        {type === 'drafting' && (
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
            <span className="flex items-center text-xs font-medium text-slate-500">
               Priority
            </span>
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'}`}>
              {priority}
            </span>
          </div>
        )}
      </div>

      {type === 'meeting' && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-medium">Reminder</span>
          <button 
            onClick={onToggleReminder}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${reminderSet ? 'bg-amber-500' : 'bg-slate-200'}`}
          >
            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${reminderSet ? 'translate-x-5' : 'translate-x-1'}`} />
          </button>
        </div>
      )}
    </div>
  );
}
