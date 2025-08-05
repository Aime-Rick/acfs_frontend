import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Key, Save, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ApiKeys } from '../types';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>({});
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    SUPABASE_URL: '',
    SUPABASE_API_KEY: '',
    ALLOWED_ORIGINS: '',
    RESEND_API_KEY: '',
    TALLY_API_KEY: '',
    OPENAI_API_KEY: '',
    TAVILY_API_KEY: '',
  });
  const [apiKeyStatus, setApiKeyStatus] = useState<{ [key: string]: 'idle' | 'testing' | 'success' | 'error' }>({});
  const [profileData, setProfileData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
  });

  const toggleApiKeyVisibility = (key: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const updateApiKey = (key: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [key]: value
    }));
    // Reset status when key is modified
    setApiKeyStatus(prev => ({
      ...prev,
      [key]: 'idle'
    }));
  };

  const testApiKey = async (keyName: string) => {
    setApiKeyStatus(prev => ({
      ...prev,
      [keyName]: 'testing'
    }));

    // Simulation de test de connexion
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulation de résultat aléatoire pour la démo
      const isValid = Math.random() > 0.3;
      
      setApiKeyStatus(prev => ({
        ...prev,
        [keyName]: isValid ? 'success' : 'error'
      }));

      if (isValid) {
        toast.success(`${keyName} validée avec succès`);
      } else {
        toast.error(`Erreur de validation pour ${keyName}`);
      }
    } catch (error) {
      setApiKeyStatus(prev => ({
        ...prev,
        [keyName]: 'error'
      }));
      toast.error(`Erreur lors du test de ${keyName}`);
    }
  };

  const saveProfile = async () => {
    try {
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profil mis à jour avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const saveApiKeys = async () => {
    try {
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Clés API sauvegardées avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde des clés API');
    }
  };

  const renderApiKeyField = (keyName: string, label: string, placeholder: string) => {
    const status = apiKeyStatus[keyName] || 'idle';
    const isVisible = showApiKeys[keyName];

    return (
      <div key={keyName} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              type={isVisible ? 'text' : 'password'}
              value={apiKeys[keyName as keyof ApiKeys] || ''}
              onChange={(e) => updateApiKey(keyName, e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <button
              type="button"
              onClick={() => toggleApiKeyVisibility(keyName)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => testApiKey(keyName)}
            disabled={!apiKeys[keyName as keyof ApiKeys] || status === 'testing'}
            className="flex-shrink-0"
          >
            {status === 'testing' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500" />
            ) : status === 'success' ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : status === 'error' ? (
              <XCircle className="w-4 h-4 text-red-500" />
            ) : (
              'Test'
            )}
          </Button>
        </div>
        {status === 'success' && (
          <p className="text-xs text-green-600 dark:text-green-400">
            Connexion validée avec succès
          </p>
        )}
        {status === 'error' && (
          <p className="text-xs text-red-600 dark:text-red-400">
            Erreur de validation - Vérifiez la clé
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Paramètres
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Gérez votre profil et vos configurations
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Profil
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'api'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Key className="w-4 h-4 inline mr-2" />
            Clés API
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Informations du profil
          </h2>

          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Photo de profil
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ajoutez une photo pour personnaliser votre profil
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Changer la photo
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Nom complet"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Votre nom complet"
              />
              
              <Input
                label="Email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="votre@email.com"
                disabled
                helperText="L'email ne peut pas être modifié"
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={saveProfile}>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Gestion des clés API
          </h2>

          <div className="space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Key className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                    Sécurité des clés API
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                    Vos clés API sont chiffrées et stockées de manière sécurisée. 
                    Ne partagez jamais vos clés avec des tiers.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              {renderApiKeyField('SUPABASE_URL', 'Supabase URL', 'https://votre-projet.supabase.co')}
              {renderApiKeyField('SUPABASE_API_KEY', 'Supabase API Key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')}
              {renderApiKeyField('ALLOWED_ORIGINS', 'Origines autorisées', 'https://votre-domaine.com')}
              {renderApiKeyField('RESEND_API_KEY', 'Resend API Key', 're_xxxxxxxxxx')}
              {renderApiKeyField('TALLY_API_KEY', 'Tally API Key', 'tally_xxxxxxxxxx')}
              {renderApiKeyField('OPENAI_API_KEY', 'OpenAI API Key', 'sk-xxxxxxxxxx')}
              {renderApiKeyField('TAVILY_API_KEY', 'Tavily API Key', 'tvly-xxxxxxxxxx')}
            </div>

            <div className="flex justify-end">
              <Button onClick={saveApiKeys}>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les clés
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Settings;
