import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Calendar, Target, AlertCircle } from 'lucide-react';
import { apiService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Mission } from '../types';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Select from '../components/UI/Select';
import Pagination from '../components/UI/Pagination';
import CreateMissionModal from '../components/Missions/CreateMissionModal';
import MissionDetailsModal from '../components/Missions/MissionDetailsModal';
import MissionCard from '../components/Missions/MissionCard';
import DeleteConfirmationModal from '../components/Missions/DeleteConfirmationModal';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [allRawMissions, setAllRawMissions] = useState<Mission[]>([]); // All missions fetched from backend
  const [displayedMissions, setDisplayedMissions] = useState<Mission[]>([]); // Missions currently visible (filtered & paginated)
  const [totalRawMissionsCount, setTotalRawMissionsCount] = useState(0); // Total count of all missions (for stats)
  const [totalFilteredMissionsCount, setTotalFilteredMissionsCount] = useState(0); // Total count after filters (for pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'this_week' | 'this_month' | 'this_year' | 'last_15_days'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [missionToDelete, setMissionToDelete] = useState<Mission | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user } = useAuth();

  // Effect to fetch all missions initially or when user changes
  useEffect(() => {
    const fetchAllMissions = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await apiService.getUserMissions(user.id);
        if (response.status === 'success') {
          const missionsData = response.data || [];
          setAllRawMissions(missionsData);
          setTotalRawMissionsCount(missionsData.length); // Set total raw count for stats
        } else {
          throw new Error(response.message || 'Failed to fetch all missions');
        }
      } catch (error: any) {
        toast.error('Erreur lors du chargement des missions');
        console.error('Error fetching all missions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMissions();
  }, [user]); // Only re-fetch all missions when user changes

  // Memoized filtered and paginated missions logic
  const filteredAndPaginatedMissions = useMemo(() => {
    let tempMissions = [...allRawMissions]; // Start with all raw missions

    // Apply search term filter - ONLY by mission name
    if (searchTerm) {
      tempMissions = tempMissions.filter(mission =>
        mission.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      tempMissions = tempMissions.filter(mission => {
        const isCompleted = !!mission.report_path;
        return filterStatus === 'completed' ? isCompleted : !isCompleted;
      });
    }

    // Apply period filter
    if (filterPeriod !== 'all') {
      const now = new Date();
      tempMissions = tempMissions.filter(mission => {
        const missionDate = new Date(mission.created_at);
        switch (filterPeriod) {
          case 'today':
            return missionDate.toDateString() === now.toDateString();
          case 'this_week':
            // Create new Date objects to avoid mutating 'now'
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
            const endOfWeek = new Date(now);
            endOfWeek.setDate(now.getDate() - now.getDay() + 6); // Saturday
            // Set hours to 00:00:00 for start and 23:59:59 for end to cover full days
            startOfWeek.setHours(0, 0, 0, 0);
            endOfWeek.setHours(23, 59, 59, 999);
            return missionDate >= startOfWeek && missionDate <= endOfWeek;
          case 'this_month':
            return missionDate.getMonth() === now.getMonth() && missionDate.getFullYear() === now.getFullYear();
          case 'this_year':
            return missionDate.getFullYear() === now.getFullYear();
          case 'last_15_days':
            const fifteenDaysAgo = new Date();
            fifteenDaysAgo.setDate(now.getDate() - 15);
            fifteenDaysAgo.setHours(0, 0, 0, 0); // Start of the day 15 days ago
            now.setHours(23, 59, 59, 999); // End of today
            return missionDate >= fifteenDaysAgo && missionDate <= now;
          default:
            return true;
        }
      });
    }

    // Update total filtered missions count and total pages based on filtered results
    setTotalFilteredMissionsCount(tempMissions.length);
    setTotalPages(Math.ceil(tempMissions.length / itemsPerPage));

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return tempMissions.slice(startIndex, endIndex);
  }, [allRawMissions, searchTerm, filterStatus, filterPeriod, currentPage]);

  // Update the displayed missions whenever filteredAndPaginatedMissions changes
  useEffect(() => {
    setDisplayedMissions(filteredAndPaginatedMissions);
  }, [filteredAndPaginatedMissions]);

  // Reset current page to 1 when filters or search term change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterPeriod]);


  const handleMissionCreated = () => {
    // Re-fetch all raw missions to include the new one
    const fetchAllMissionsAndReset = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await apiService.getUserMissions(user.id);
        if (response.status === 'success') {
          const missionsData = response.data || [];
          setAllRawMissions(missionsData);
          setTotalRawMissionsCount(missionsData.length);
          setCurrentPage(1); // Go back to the first page after creation
        } else {
          throw new Error(response.message || 'Failed to fetch all missions after creation');
        }
      } catch (error: any) {
        toast.error('Erreur lors du rechargement des missions après création');
        console.error('Error fetching all missions after creation:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllMissionsAndReset();
    setShowCreateModal(false);
    toast.success('Mission créée avec succès !');
  };

  const handleConfirmDelete = async () => {
    if (!missionToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await apiService.deleteMission(missionToDelete.id);
      if (response.status === 'success') {
        toast.success('Mission supprimée avec succès !');
        // Re-fetch all raw missions after deletion
        const fetchAllMissionsAndAdjustPage = async () => {
          if (!user) return;
          setLoading(true);
          try {
            const response = await apiService.getUserMissions(user.id);
            if (response.status === 'success') {
              const missionsData = response.data || [];
              setAllRawMissions(missionsData);
              setTotalRawMissionsCount(missionsData.length);
              
              // Adjust current page if the last item on a page was deleted
              const newTotalFiltered = missionsData.filter(m => {
                // Re-apply current filters to determine the new total filtered count
                // This is important if a filtered item was deleted
                const isSearchMatch = searchTerm ? (m.name.toLowerCase().includes(searchTerm.toLowerCase())) : true; // Updated search logic here
                const isStatusMatch = filterStatus !== 'all' ? (filterStatus === 'completed' ? !!m.report_path : !m.report_path) : true;
                
                // Simplified date check for re-calculation, full logic is in useMemo
                const isPeriodMatch = filterPeriod !== 'all' ? (
                  (() => {
                    const missionDate = new Date(m.created_at);
                    const now = new Date();
                    switch (filterPeriod) {
                      case 'today': return missionDate.toDateString() === now.toDateString();
                      case 'this_week':
                        const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0,0,0,0);
                        const endOfWeek = new Date(now); endOfWeek.setDate(now.getDate() - now.getDay() + 6); endOfWeek.setHours(23,59,59,999);
                        return missionDate >= startOfWeek && missionDate <= endOfWeek;
                      case 'this_month': return missionDate.getMonth() === now.getMonth() && missionDate.getFullYear() === now.getFullYear();
                      case 'this_year': return missionDate.getFullYear() === now.getFullYear();
                      case 'last_15_days':
                        const fifteenDaysAgo = new Date(); fifteenDaysAgo.setDate(now.getDate() - 15); fifteenDaysAgo.setHours(0,0,0,0);
                        const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
                        return missionDate >= fifteenDaysAgo && missionDate <= todayEnd;
                      default: return true;
                    }
                  })()
                ) : true;

                return isSearchMatch && isStatusMatch && isPeriodMatch;
              }).length;

              const newMaxPage = Math.max(1, Math.ceil(newTotalFiltered / itemsPerPage));
              if (currentPage > newMaxPage) {
                setCurrentPage(newMaxPage);
              }
            } else {
              throw new Error(response.message || 'Failed to fetch all missions after deletion');
            }
          } catch (error: any) {
            toast.error('Erreur lors du rechargement des missions après suppression');
            console.error('Error fetching all missions after deletion:', error);
          } finally {
            setLoading(false);
          }
        };
        fetchAllMissionsAndAdjustPage();
      } else {
        throw new Error(response.message || 'Failed to delete mission');
      }
    } catch (error: any) {
      toast.error('Erreur lors de la suppression de la mission');
      console.error('Error deleting mission:', error);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setMissionToDelete(null);
    }
  };

  const handleViewMission = (mission: Mission) => {
    setSelectedMission(mission);
    setShowDetailsModal(true);
  };

  const handleRequestDelete = (mission: Mission) => {
    setMissionToDelete(mission);
    setShowDeleteModal(true);
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
                {totalRawMissionsCount} {/* Use totalRawMissionsCount here */}
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
                {allRawMissions.filter(m => { // Filter from allRawMissions for stats
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
                {allRawMissions.filter(m => m.report_path).length} {/* Filter from allRawMissions for stats */}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher une mission..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <Select
          value={filterStatus}
          onChange={(value) => setFilterStatus(value as 'all' | 'completed' | 'in_progress')}
          options={[
            { value: 'all', label: 'Tous les statuts' },
            { value: 'in_progress', label: 'En cours' },
            { value: 'completed', label: 'Terminées' }
          ]}
          className="w-full sm:w-auto"
        />
        <Select
          value={filterPeriod}
          onChange={(value) => setFilterPeriod(value as 'all' | 'today' | 'this_week' | 'this_month' | 'this_year' | 'last_15_days')}
          options={[
            { value: 'all', label: 'Toutes les périodes' },
            { value: 'today', label: 'Aujourd\'hui' },
            { value: 'this_week', label: 'Cette semaine' },
            { value: 'this_month', label: 'Ce mois' },
            { value: 'this_year', label: 'Cette année' },
            { value: 'last_15_days', label: 'Les 15 derniers jours' }
          ]}
          className="w-full sm:w-auto"
        />
      </div>

      {/* Missions Grid */}
      {displayedMissions.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {totalFilteredMissionsCount === 0 ? 'Aucune mission' : 'Aucun résultat'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {totalFilteredMissionsCount === 0 
              ? 'Créez votre première mission pour commencer'
              : 'Essayez de modifier votre recherche ou vos filtres'
            }
          </p>
          {totalRawMissionsCount === 0 && ( // Only show create button if no missions at all
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer une mission
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedMissions.map((mission, index) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                index={index}
                onView={handleViewMission}
                onDelete={handleRequestDelete}
                onDownloadReport={handleDownloadReport}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {totalFilteredMissionsCount > itemsPerPage && totalPages > 1 && ( // Only show pagination if there are more items than one page
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalFilteredMissionsCount} // Use totalFilteredMissionsCount here
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !deleteLoading && setShowDeleteModal(false)}
        size="sm"
      >
        {missionToDelete && (
          <DeleteConfirmationModal
            missionName={missionToDelete.name}
            onConfirm={handleConfirmDelete}
            onClose={() => setShowDeleteModal(false)}
            isLoading={deleteLoading}
          />
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
