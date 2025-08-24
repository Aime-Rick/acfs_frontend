import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, BarChart3, RefreshCw, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { apiService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Mission } from '../types';
import Button from '../components/UI/Button';
import Select from '../components/UI/Select';
import toast from 'react-hot-toast';

const Analysis: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
        setMissions((response.data as Mission[]) || []);
      } else {
        throw new Error(response.message || 'Failed to fetch missions');
      }
    } catch (error: any) {
      toast.error('Erreur lors du chargement des missions');
      console.error('Error fetching missions:', error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Format de fichier non supporté. Utilisez CSV ou Excel.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (max 10MB).');
      return;
    }

    setFile(selectedFile);
    toast.success('Fichier sélectionné avec succès !');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const analyzeData = async () => {
    if (!selectedMission || !file) {
      toast.error('Veuillez sélectionner une mission et un fichier');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResults(null);

    try {
      const mission = missions.find(m => m.id.toString() === selectedMission);
      if (!mission) throw new Error('Mission non trouvée');

      const response = await apiService.runEDA(mission.name, file);
      
      if (response.status === 'success' && (response.data as any)?.report) {
        setAnalysisResults((response.data as any).report);
      } else {
        throw new Error(response.message || 'Analysis failed');
      }

      toast.success('Analyse terminée avec succès !');
    } catch (error: any) {
      toast.error("Erreur lors de l'analyse des données");
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setAnalysisResults(null);
    setSelectedMission('');
  };

  const saveReportToPdf = async () => {
    if (!analysisResults || !selectedMission) {
      toast.error('Aucun rapport à sauvegarder');
      return;
    }

    setIsSaving(true);

    try {
      const mission = missions.find(m => m.id.toString() === selectedMission);
      if (!mission) {
        throw new Error('Mission non trouvée');
      }

      const fileName = `analyse-${mission.name.replace(/\s+/g, '_')}-${Date.now()}`;
      
      const response = await apiService.saveReportToPdf(
        analysisResults,
        'analysis',
        fileName,
        mission.name
      );

      if (response.status === 'success') {
        toast.success('Rapport sauvegardé avec succès !');
      } else {
        throw new Error(response.message || 'Échec de la sauvegarde');
      }
    } catch (error: any) {
      toast.error('Erreur lors de la sauvegarde du rapport');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analyse de Données
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Générez un rapport d'analyse exploratoire (EDA) à partir de vos données.
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
            Configuration de l'analyse
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mission
              </label>
              <Select
                value={selectedMission}
                onChange={setSelectedMission}
                options={[
                  { value: '', label: 'Sélectionner une mission' },
                  ...missions.map(mission => ({
                    value: mission.id.toString(),
                    label: mission.name
                  }))
                ]}
                placeholder="Sélectionner une mission"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fichier de données
              </label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                  dragActive
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-orange-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  {file ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Glissez-déposez votre fichier ici ou cliquez pour sélectionner
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        CSV, Excel (max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={analyzeData}
                loading={isAnalyzing}
                disabled={!selectedMission || !file}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2 animate-pulse" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analyser
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={resetAnalysis}
                disabled={isAnalyzing}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Results Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Rapport d'analyse
            </h2>
            {analysisResults && (
              <div className="flex space-x-2">
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={saveReportToPdf}
                  loading={isSaving}
                  disabled={!selectedMission}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            )}
          </div>

          <div className="min-h-96 flex-grow overflow-y-auto pr-2">
            {!analysisResults && !isAnalyzing && (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Le rapport d'analyse apparaîtra ici</p>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Génération du rapport en cours...
                  </p>
                </div>
              </div>
            )}

            {analysisResults && (
              <div className="w-full h-full max-h-96 overflow-y-auto p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                <article className="prose prose-gray dark:prose-invert max-w-none prose-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {analysisResults}
                  </ReactMarkdown>
                </article>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analysis;
