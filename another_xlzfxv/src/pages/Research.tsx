import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Edit3, Play, Loader } from 'lucide-react';
import { apiService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Mission } from '../types';
import Button from '../components/UI/Button';
import toast from 'react-hot-toast';

const Research: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<string>('');
  const [results, setResults] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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

  const handleSearch = async () => {
    if (!selectedMission) {
      toast.error('Veuillez sélectionner une mission');
      return;
    }

    setIsSearching(true);
    setResults('');

    try {
      const mission = missions.find(m => m.id.toString() === selectedMission);
      if (!mission) throw new Error('Mission non trouvée');

      const response = await apiService.deepResearch(
        mission.context || '',
        mission.problem || '',
        mission.objectif || '',
        mission.name
      );

      if (response.status === 'success' && response.data?.report) {
        setResults(response.data.report);
      } else {
        throw new Error(response.message || 'Research failed');
      }

      toast.success('Recherche terminée !');
    } catch (error: any) {
      toast.error('Erreur lors de la recherche');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleExport = (format: 'word' | 'pdf') => {
    if (!results) {
      toast.error('Aucun résultat à exporter');
      return;
    }

    // Simulation d'export
    toast.success(`Export ${format.toUpperCase()} en cours...`);
    
    // Créer un blob avec le contenu
    const blob = new Blob([results], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recherche-${selectedMission}.${format === 'word' ? 'txt' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Recherche Approfondie
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Explorez et analysez des données avec l'IA
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
            Configuration de la recherche
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

            <Button
              onClick={handleSearch}
              loading={isSearching}
              disabled={!selectedMission}
              className="w-full"
            >
              {isSearching ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Recherche en cours...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Lancer la recherche
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Results Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Résultats
            </h2>
            {results && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {isEditing ? 'Aperçu' : 'Éditer'}
                </Button>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('word')}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Word
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('pdf')}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="min-h-96">
            {!results && !isSearching && (
              <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Les résultats de recherche apparaîtront ici</p>
                </div>
              </div>
            )}

            {isSearching && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Loader className="w-5 h-5 animate-spin text-orange-500" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Recherche en cours...
                  </span>
                </div>
                {results && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                      {results}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {results && !isSearching && (
              <div>
                {isEditing ? (
                  <textarea
                    value={results}
                    onChange={(e) => setResults(e.target.value)}
                    className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                  />
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                      {results}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Research;
