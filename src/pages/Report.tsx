import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileOutput, Loader, UploadCloud, X, File as FileIcon, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { apiService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Mission } from '../types';
import Button from '../components/UI/Button';
import Select from '../components/UI/Select';
import toast from 'react-hot-toast';

const Report: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string>('');
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
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
        setMissions(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error(response.message || 'Failed to fetch missions');
      }
    } catch (error: any) {
      toast.error('Erreur lors du chargement des missions');
      console.error('Error fetching missions:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setDocumentFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setDocumentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (!selectedMission || documentFiles.length === 0) {
      toast.error('Veuillez sélectionner une mission et des fichiers');
      return;
    }

    const mission = missions.find(m => m.id.toString() === selectedMission);
    if (!mission) {
      toast.error('Mission non trouvée');
      return;
    }

    setIsUploading(true);
    const uploadToast = toast.loading(`Téléchargement de ${documentFiles.length} fichier(s)...`);
    
    try {
      const response = await apiService.uploadMultipleFiles(mission.name, documentFiles);
      if (response.status === 'success') {
        const uploadedFileNames = documentFiles.map(file => file.name);
        setUploadedFiles(prev => [...prev, ...uploadedFileNames]);
        setDocumentFiles([]); // Clear selected files after successful upload
        toast.success(`${documentFiles.length} fichier(s) téléchargé(s) avec succès !`, { id: uploadToast });
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error: any) {
      toast.error('Erreur lors du téléchargement des fichiers.', { id: uploadToast });
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const clearUploadedFiles = () => {
    setUploadedFiles([]);
    toast.success('Liste des fichiers téléchargés effacée');
  };

  const formatReportContent = (content: any): string => {
    if (typeof content === 'string') {
      return content;
    }
    
    if (content && typeof content === 'object') {
      // Si c'est un objet avec une propriété text
      if (content.text) {
        return content.text;
      }
      
      // Si c'est un tableau d'objets avec du texte
      if (Array.isArray(content)) {
        return content.map(item => {
          if (typeof item === 'string') return item;
          if (item && item.text) return item.text;
          return JSON.stringify(item);
        }).join('\n');
      }
      
      // Sinon, convertir en JSON lisible
      return JSON.stringify(content, null, 2);
    }
    
    return String(content || '');
  };

  const generateReport = async () => {
    if (!selectedMission) {
      toast.error('Veuillez sélectionner une mission');
      return;
    }

    const mission = missions.find(m => m.id.toString() === selectedMission);
    if (!mission) {
      toast.error('Mission non trouvée');
      return;
    }

    setIsGenerating(true);
    setGeneratedReport('');

    try {
      const response = await apiService.generateFinalReport(
        mission.name,
        mission.context || '',
        mission.problem || '',
        Array.isArray(mission.objectif) ? mission.objectif.join(', ') : (mission.objectif || '')
      );

      if (response.status === 'success' && response.data && (response.data as any).report) {
        const reportContent = formatReportContent((response.data as any).report);
        setGeneratedReport(reportContent);
        toast.success('Rapport généré avec succès !');
      } else {
        throw new Error(response.message || 'Report generation failed');
      }
    } catch (error: any) {
      toast.error('Erreur lors de la génération du rapport');
      console.error('Report generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveReportToPdf = async () => {
    if (!generatedReport || !selectedMission) {
      toast.error('Aucun rapport à sauvegarder');
      return;
    }

    setIsSaving(true);

    try {
      const mission = missions.find(m => m.id.toString() === selectedMission);
      if (!mission) {
        throw new Error('Mission non trouvée');
      }

      const fileName = `rapport-final-${mission.name.replace(/\s+/g, '_')}-${Date.now()}`;
      
      // Save the report to PDF
      const saveResponse = await apiService.saveReportToPdf(
        generatedReport,
        'final_report',
        fileName,
        mission.name
      );

      if (saveResponse.status === 'success') {
        // Update the mission with the report path
        const reportPath = (saveResponse.data as any)?.report_path;
        if (reportPath) {
          const updateResponse = await apiService.updateMission(mission.id.toString(), {
            report_path: reportPath
          });
          
          if (updateResponse.status === 'success') {
            toast.success('Rapport sauvegardé et mission mise à jour avec succès !');
            // Refresh missions to get updated data
            await fetchMissions();
          } else {
            toast.success('Rapport sauvegardé mais erreur lors de la mise à jour de la mission');
          }
        } else {
          toast.success('Rapport sauvegardé avec succès !');
        }
      } else {
        throw new Error(saveResponse.message || 'Échec de la sauvegarde');
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Documents additionnels (optionnels)
              </label>
              
              {/* Fichiers déjà uploadés */}
              {uploadedFiles.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-green-600 dark:text-green-400">
                      Fichiers téléchargés ({uploadedFiles.length})
                    </h4>
                    <button
                      onClick={clearUploadedFiles}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Effacer la liste
                    </button>
                  </div>
                  <div className="space-y-2">
                    {uploadedFiles.map((fileName, index) => (
                      <div key={index} className="flex items-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <FileIcon className="w-4 h-4 text-green-500 dark:text-green-400 mr-2" />
                        <span className="text-sm text-green-700 dark:text-green-300">{fileName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Liste des fichiers sélectionnés */}
              {documentFiles.length > 0 && (
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fichiers à télécharger ({documentFiles.length})
                    </h4>
                    <Button
                      onClick={uploadFiles}
                      loading={isUploading}
                      disabled={!selectedMission || documentFiles.length === 0}
                      size="sm"
                      className="ml-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader className="w-4 h-4 mr-1 animate-spin" />
                          Upload...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4 mr-1" />
                          Télécharger
                        </>
                      )}
                    </Button>
                  </div>
                  {documentFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center space-x-3">
                        <FileIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-800 dark:text-gray-200 truncate">{file.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button 
                        onClick={() => removeFile(index)} 
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Zone de drop/upload */}
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600 px-6 py-10">
                <div className="text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white dark:bg-gray-800 font-semibold text-orange-600 dark:text-orange-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-600 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-800 hover:text-orange-500">
                      <span>Sélectionner des fichiers</span>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        multiple 
                        className="sr-only" 
                        onChange={handleFileChange} 
                      />
                    </label>
                    <p className="pl-1">ou glissez-déposez</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-500 dark:text-gray-500">
                    PDF, DOCX, TXT jusqu'à 10MB chacun
                  </p>
                  {documentFiles.length > 0 && (
                    <p className="text-xs leading-5 text-orange-600 dark:text-orange-400 mt-1">
                      {documentFiles.length} fichier(s) sélectionné(s)
                    </p>
                  )}
                </div>
              </div>
            </div>

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
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Aperçu du rapport
            </h2>
            {generatedReport && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={saveReportToPdf}
                  loading={isSaving}
                  disabled={!selectedMission}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Sauvegarder
                </Button>
              </div>
            )}
          </div>

          <div className="min-h-96 flex-grow overflow-y-auto pr-2">
            {!generatedReport && !isGenerating && (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <FileOutput className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>L'aperçu du rapport apparaîtra ici</p>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Génération du rapport en cours...
                  </p>
                </div>
              </div>
            )}

            {generatedReport && (
              <div className="w-full h-full max-h-96 overflow-y-auto p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                <article className="prose prose-gray dark:prose-invert max-w-none prose-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {typeof generatedReport === 'string' ? generatedReport : formatReportContent(generatedReport)}
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

export default Report;
