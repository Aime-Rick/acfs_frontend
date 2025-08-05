import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Target, AlertCircle } from 'lucide-react';
import { Mission } from '../../types';

interface MissionCardProps {
  mission: Mission;
  index: number;
}

const MissionCard: React.FC<MissionCardProps> = ({ mission, index }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
          {mission.name}
        </h3>
        <div className="p-1 bg-orange-100 dark:bg-orange-900/20 rounded">
          <Target className="w-4 h-4 text-orange-500" />
        </div>
      </div>

      {mission.context && (
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {mission.context}
        </p>
      )}

      {mission.objectif && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Objectif
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {mission.objectif}
          </p>
        </div>
      )}

      {mission.problem && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Problématique
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {mission.problem}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(mission.created_at)}</span>
        </div>
        <div className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded">
          Active
        </div>
      </div>
    </motion.div>
  );
};

export default MissionCard;
