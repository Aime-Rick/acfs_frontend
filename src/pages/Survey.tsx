import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Send, Mail, ExternalLink, Loader, Clipboard } from 'lucide-react';
import { apiService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Mission } from '../types';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import toast from 'react-hot-toast';

const Survey: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<string>('');
  const [formConfig, setFormConfig] = useState({
    title: '',
  });
  const [generatedFormUrl, setGeneratedFormUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    recipients: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false); // New state for email generation loading
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMissions();
    }
  }, [user]);

  useEffect(() => {
    if (selectedMission) {
      const mission = missions.find(m => m.id.toString() === selectedMission);
      if (mission) {
        setFormConfig(prev => ({
          ...prev,
          title: `Enquête - ${mission.name}`,
        }));
        // Auto-set subject based on mission name
        setEmailData(prev => ({
          ...prev,
          subject: `Enquête - ${mission.name}`,
          // Keep message empty initially, user can generate or type
          message: '' 
        }));
      }
    }
  }, [selectedMission, missions]);

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

  const generateForm = async () => {
    if (!selectedMission || !formConfig.title) {
      toast.error('Veuillez sélectionner une mission et saisir un titre');
      return;
    }

    setIsGenerating(true);
    try {
      const mission = missions.find(m => m.id.toString() === selectedMission);
      if (!mission) throw new Error('Mission non trouvée');
      const response = await apiService.createSurvey(
        formConfig.title, // Pass the form title
        mission.context || '',
        mission.problem || '',
        mission.objectif || ['']
      );

      if (response.status === 'success' && response.data?.form_url) {
        setGeneratedFormUrl(response.data.form_url);
        
        // Update mission with form URL
        await apiService.updateMission(selectedMission, {
          form_url: response.data.form_url,
          form_id: response.data.form_id || `form-${Date.now()}`
        });
      } else {
        throw new Error(response.message || 'Form generation failed');
      }

      toast.success('Formulaire généré avec succès !');
    } catch (error: any) {
      toast.error('Erreur lors de la génération du formulaire');
      console.error('Form generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyUrl = () => {
    if (generatedFormUrl) {
      navigator.clipboard.writeText(generatedFormUrl)
        .then(() => toast.success('Lien copié dans le presse-papiers !'))
        .catch(() => toast.error('Échec de la copie du lien.'));
    }
  };

  const handleGenerateEmail = async () => {
    if (!selectedMission) {
      toast.error('Veuillez sélectionner une mission pour générer l\'email');
      return;
    }

    setIsGeneratingEmail(true);
    try {
      const mission = missions.find(m => m.id.toString() === selectedMission);
      if (!mission) throw new Error('Mission non trouvée');

      const response = await apiService.generateEmail(
        mission.context || '',
        mission.objectif || [''],
        mission.problem || ''
      );

      if (response.status === 'success' && response.data?.email_content) {
        setEmailData(prev => ({
          ...prev,
          message: response.data.email_content,
        }));
        toast.success('Message email généré avec succès !');
      } else {
        throw new Error(response.message || 'Email generation failed');
      }
    } catch (error: any) {
      toast.error('Erreur lors de la génération du message email');
      console.error('Email generation error:', error);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const validateEmails = (emailString: string): boolean => {
    const eam = emailString
    return true
  };

  const sendEmails = async () => {
    if (!generatedFormUrl) {
      toast.error('Veuillez d\'abord générer un formulaire');
      return;
    }

    if (!emailData.recipients || !validateEmails(emailData.recipients)) {
      toast.error('Veuillez saisir les numéros whatsapp valides');
      return;
    }

    setIsSending(true);
    try {
      const emails = emailData.recipients.split(',').map(email => email.trim());
      const messageWithLink = `${emailData.message}\n\nLien du formulaire: ${generatedFormUrl}`;
      
      const response = await apiService.sendEmail(
        emails,
        messageWithLink
      );

      if (response.status === 'success') {
        toast.success(`${emails.length} email(s) envoyé(s) avec succès !`);
        setEmailData(prev => ({ ...prev, recipients: '' }));
      } else {
        throw new Error(response.message || 'Email sending failed');
      }
    } catch (error: any) {
      toast.error('Erreur lors de l\'envoi des emails');
      console.error('Email sending error:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Génération de Formulaires
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Créez et diffusez des enquêtes personnalisées
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form Configuration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Configuration du formulaire
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

            <Input
              label="Titre du formulaire"
              value={formConfig.title}
              onChange={(e) => setFormConfig(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Titre de votre enquête"
            />

            <Button
              onClick={generateForm}
              loading={isGenerating}
              disabled={!selectedMission || !formConfig.title}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Générer le formulaire
                </>
              )}
            </Button>

            {generatedFormUrl && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-400">
                      Formulaire généré !
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-1 break-all">
                      {generatedFormUrl}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyUrl}
                      title="Copier le lien"
                    >
                      <Clipboard className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(generatedFormUrl, '_blank')}
                      title="Ouvrir dans un nouvel onglet"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Email Sending */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Diffusion par whatsapp
          </h2>

          <div className="space-y-6">

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Message
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateEmail}
                  loading={isGeneratingEmail}
                  disabled={!selectedMission || isGeneratingEmail}
                >
                  {isGeneratingEmail ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Générer le message
                    </>
                  )}
                </Button>
              </div>
              <textarea
                value={emailData.message}
                onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Votre message..."
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Numéros
              </label>
              <textarea
                value={emailData.recipients}
                onChange={(e) => setEmailData(prev => ({ ...prev, recipients: e.target.value }))}
                placeholder="2290152876230, 2290152476420, ..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Séparez les numéros whatsapp par des virgules
              </p>
            </div>

            <Button
              onClick={sendEmails}
              loading={isSending}
              disabled={!generatedFormUrl || !emailData.recipients}
              className="w-full"
            >
              {isSending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>

            {!generatedFormUrl && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-400">
                    Générez d'abord un formulaire pour pouvoir l'envoyer par whatsapp.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Survey;
