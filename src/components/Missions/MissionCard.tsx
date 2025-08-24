import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Target, Eye, Trash2, Download, CheckCircle, Clock } from 'lucide-react';
import { Mission } from '../../types';
import Button from '../UI/Button';

interface MissionCardProps {
  mission: Mission;
  index: number;
  onView: (mission: Mission) => void;
  onDelete: (mission: Mission) => void;
  onDownloadReport: (reportPath: string) => void;
}

const MissionCard: React.FC<MissionCardProps> = ({ 
  mission, 
  index, 
  onView, 
  onDelete, 
  onDownloadReport 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusInfo = () => {
    if (mission.report_path) {
      return {
        status: 'completed',
        label: 'Terminée',
        icon: CheckCircle,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/20'
      };
    }
    return {
      status: 'in_progress',
      label: 'En cours',
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-shadow"
    >
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {mission.name}
          </h3>
          <div className="p-1 bg-orange-100 dark:bg-orange-900/20 rounded">
            <Target className="w-4 h-4 text-orange-500" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(mission.created_at)}</span>
          </div>
          <div className={`px-2 py-1 ${statusInfo.bgColor} ${statusInfo.color} text-xs font-medium rounded flex items-center space-x-1`}>
            <StatusIcon className="w-3 h-3" />
            <span>{statusInfo.label}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between space-x-2 mt-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(mission)}
          >
            <Eye className="w-4 h-4 mr-1" />
            Voir
          </Button>
          
          {mission.report_path && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownloadReport(mission.report_path!)}
            >
              <Download className="w-4 h-4 mr-1" />
              Rapport
            </Button>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(mission)}
          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default MissionCard;
