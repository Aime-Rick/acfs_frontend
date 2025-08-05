import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Calendar, Target, AlertCircle } from 'lucide-react';
import { apiService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Mission } from '../types';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Pagination from '../components/UI/Pagination';
import CreateMissionModal from '../components/Missions/CreateMissionModal';
import MissionDetailsModal from '../components/Missions/MissionDetailsModal';
import MissionCard from '../components/Missions/MissionCard';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [totalMissions, setTotalMissions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMissions(currentPage);
    }
  }, [user, currentPage]);

  const fetchMissions = async (page: number = 1) => {
    setLoading(true);
    try {
      // For now, we'll use the existing endpoint and implement client-side pagination
      // In a real implementation, you'd want server-side pagination
      const response = await apiService.getUserMissions(user?.id || '');
      if (response.status === 'success') {
        const allMissions = response.data || [];
        setTotalMissions(allMissions.length);
        setTotalPages(Math.ceil(allMissions.length / itemsPerPage));
        
        // Client-side pagination
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setMissions(allMissions.slice(startIndex, endIndex));
      } else {
        throw new Error(response.message || 'Failed to fetch missions');
      }
    } catch (error: any) {
      toast.error('Erreur lors du chargement des missions');
      console.error('Error fetching missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMissionCreated = (newMission: Mission) => {
    // Refresh the missions list to get updated pagination
    fetchMissions(1);
    setCurrentPage(1);
    setShowCreateModal(false);
    toast.success('Mission créée avec succès !');
  };

  const handleViewMission = (mission: Mission) => {
    setSelectedMission(mission);
    setShowDetailsModal(true);
  };

  const handleDeleteMission = async (missionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette mission ?')) {
      return;
    }

    setDeleteLoading(missionId);
    try {
      const response = await apiService.deleteMission(missionId);
      if (response.status === 'success') {
        toast.success('Mission supprimée avec succès !');
        // Refresh missions and adjust page if necessary
        const newTotalMissions = totalMissions - 1;
        const newTotalPages = Math.ceil(newTotalMissions / itemsPerPage);
        
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        } else {
          fetchMissions(currentPage);
        }
      } else {
        throw new Error(response.message || 'Failed to delete mission');
      }
    } catch (error: any) {
      toast.error('Erreur lors de la suppression de la mission');
      console.error('Error deleting mission:', error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDownloadReport = async (reportPath: string) => {
    try {
      await apiService.downloadReport(reportPath);
      toast.success('Téléchargement du rapport en cours...');
    } catch (error: any) {
      toast.error('Erreur lors du téléchargement du rapport');
      console.error('Error downloading report:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const filteredMissions = missions.filter(mission =>
    mission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mission.context?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mission.objectif?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gérez vos missions stratégiques
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="mt-4 sm:mt-0">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Mission
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Target className="w-6 h-6 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Total Missions
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalMissions}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Calendar className="w-6 h-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Ce mois
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {missions.filter(m => {
                  const missionDate = new Date(m.created_at);
                  const now = new Date();
                  return missionDate.getMonth() === now.getMonth() && 
                         missionDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Terminées
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {missions.filter(m => m.report_path).length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher une mission..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Missions Grid */}
      {filteredMissions.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {totalMissions === 0 ? 'Aucune mission' : 'Aucun résultat'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {totalMissions === 0 
              ? 'Créez votre première mission pour commencer'
              : 'Essayez de modifier votre recherche'
            }
          </p>
          {totalMissions === 0 && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer une mission
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMissions.map((mission, index) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                index={index}
                onView={handleViewMission}
                onDelete={handleDeleteMission}
                onDownloadReport={handleDownloadReport}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {!searchTerm && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalMissions}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      )}

      {/* Create Mission Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Créer une nouvelle mission"
        size="lg"
      >
        <CreateMissionModal
          onMissionCreated={handleMissionCreated}
          onClose={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Mission Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Détails de la mission"
        size="xl"
      >
        {selectedMission && (
          <MissionDetailsModal
            mission={selectedMission}
            onDownloadReport={handleDownloadReport}
          />
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
