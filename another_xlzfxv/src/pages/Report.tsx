import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileOutput, Download, Eye, Settings, Loader } from 'lucide-react';
import { apiService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Mission } from '../types';
import Button from '../components/UI/Button';
import toast from 'react-hot-toast';

const Report: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMissions();
    }
  }, [user]);

  const fetchMissions = async () => {
    try {
      const response = await apiService.getUserMissions(user?.id || '');
      if (response.status === 'success') {
        setMissions(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch missions');
      }
    } catch (error: any) {
      toast.error('Erreur lors du chargement des missions');
      console.error('Error fetching missions:', error);
    }
  };

  const generateReport = async () => {
    if (!selectedMission) {
      toast.error('Veuillez sélectionner une mission');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setGeneratedReport('');

    try {
      const mission = missions.find(m => m.id.toString() === selectedMission);
      if (!mission) throw new Error('Mission non trouvée');

      // Simulate progress updates
      const progressSteps = [20, 40, 60, 80, 100];
      for (const step of progressSteps) {
        setProgress(step);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const response = await apiService.generateFinalReport(
        mission.name,
        mission.context || '',
        mission.problem || '',
        mission.objectif || ''
      );

      if (response.status === 'success' && response.data?.report) {
        setGeneratedReport(response.data.report);
      } else {
        throw new Error(response.message || 'Report generation failed');
      }

      toast.success('Rapport généré avec succès !');
    } catch (error: any) {
      toast.error('Erreur lors de la génération du rapport');
      console.error('Report generation error:', error);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const exportReport = (format: 'word' | 'pdf') => {
    if (!generatedReport) {
      toast.error('Aucun rapport à exporter');
      return;
    }

    if (format === 'pdf') {
      // Use API to convert to PDF
      apiService.convertReportToPdf(
        generatedReport,
        'final_report',
        `rapport-${selectedMission}-${Date.now()}`
      ).then(response => {
        if (response.status === 'success') {
          toast.success('Export PDF terminé !');
        } else {
          throw new Error(response.message || 'PDF conversion failed');
        }
      }).catch(error => {
        toast.error('Erreur lors de l\'export PDF');
        console.error('PDF export error:', error);
      });
    } else {
      // Simple text download for Word format
      const blob = new Blob([generatedReport], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-${selectedMission}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Export Word terminé !');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Génération de Rapports
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Créez des rapports professionnels automatisés
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Configuration du rapport
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mission
              </label>
              <select
                value={selectedMission}
                onChange={(e) => setSelectedMission(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Sélectionner une mission</option>
                {missions.map((mission) => (
                  <option key={mission.id} value={mission.id}>
                    {mission.name}
                  </option>
                ))}
              </select>
            </div>

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Progression</span>
                  <span className="text-orange-500 font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={generateReport}
              loading={isGenerating}
              disabled={!selectedMission}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <FileOutput className="w-4 h-4 mr-2" />
                  Générer le rapport
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Preview Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Aperçu du rapport
            </h2>
            {generatedReport && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportReport('word')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Word
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportReport('pdf')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
              </div>
            )}
          </div>

          <div className="min-h-96">
            {!generatedReport && !isGenerating && (
              <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <FileOutput className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>L'aperçu du rapport apparaîtra ici</p>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Génération du rapport en cours...
                  </p>
                </div>
              </div>
            )}

            {generatedReport && !isGenerating && (
              <div className="h-96 overflow-y-auto">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
                    {generatedReport}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Report;
