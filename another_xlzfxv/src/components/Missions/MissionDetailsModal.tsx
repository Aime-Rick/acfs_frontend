import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Target, 
  AlertCircle, 
  FileText, 
  Download, 
  CheckCircle, 
  Clock,
  ExternalLink,
  Hash
} from 'lucide-react';
import { Mission } from '../../types';
import Button from '../UI/Button';

interface MissionDetailsModalProps {
  mission: Mission;
  onDownloadReport: (reportPath: string) => void;
}

const MissionDetailsModal: React.FC<MissionDetailsModalProps> = ({
  mission,
  onDownloadReport,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {mission.name}
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Créée le {formatDate(mission.created_at)}</span>
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 ${statusInfo.bgColor} ${statusInfo.color} text-sm font-medium rounded-full flex items-center space-x-2`}>
          <StatusIcon className="w-4 h-4" />
          <span>{statusInfo.label}</span>
        </div>
      </div>

      {/* Mission Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Context */}
          {mission.context && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Contexte</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {mission.context}
              </p>
            </div>
          )}

          {/* Objective */}
          {mission.objectif && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Objectif</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {mission.objectif}
              </p>
            </div>
          )}

          {/* Problem */}
          {mission.problem && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Problématique</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {mission.problem}
              </p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Form Information */}
          {mission.form_id && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Hash className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Formulaire</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">ID du formulaire:</span>
                  <code className="text-xs bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                    {mission.form_id}
                  </code>
                </div>
                {mission.form_url && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Lien:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(mission.form_url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Ouvrir
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* KPIs */}
          {mission.kpis && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">KPIs</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {mission.kpis}
              </p>
            </div>
          )}

          {/* Tools */}
          {mission.outils && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Outils</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {mission.outils}
              </p>
            </div>
          )}

          {/* Constraints */}
          {mission.contraintes && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Contraintes</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {mission.contraintes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center pt-6 border-t border-gray-200 dark:border-gray-700">
        {mission.report_path ? (
          <Button
            onClick={() => onDownloadReport(mission.report_path!)}
            size="lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Télécharger le rapport final
          </Button>
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400 mb-2">
              <Clock className="w-5 h-5" />
              <span>Mission en cours</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Le rapport final sera disponible une fois la mission terminée
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MissionDetailsModal;