import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ChevronRight, ChevronLeft, Plus, X, UploadCloud } from 'lucide-react';
import { apiService } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Mission, CreateMissionData, ScopeOutput } from '../../types';
import Button from '../UI/Button';
import Input from '../UI/Input';
import toast from 'react-hot-toast';

const step1Schema = yup.object({
  name: yup.string().required('Nom de la mission requis').min(3, 'Minimum 3 caractères'),
});

const step2Schema = yup.object({
  context: yup.string().max(500, 'Maximum 500 caractères'),
  problem: yup.string(),
  kpis: yup.string(),
  outils: yup.string(),
  sector: yup.string().optional(), // New field for sector
});

interface CreateMissionModalProps {
  onMissionCreated: (mission: Mission) => void;
  onClose: () => void;
}

const CreateMissionModal: React.FC<CreateMissionModalProps> = ({
  onMissionCreated,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cadrageLoading, setCadrageLoading] = useState(false); // New loading state for cadrage generation
  const [contraintes, setContraintes] = useState<string[]>(['']);
  const [objectifs, setObjectifs] = useState<string[]>(['', '']);
  const [cadrageDoc, setCadrageDoc] = useState<File | null>(null); // State for uploaded document
  const { user } = useAuth();

  const step1Form = useForm({
    resolver: yupResolver(step1Schema),
  });

  const step2Form = useForm({
    resolver: yupResolver(step2Schema),
    defaultValues: {
      context: '',
      problem: '',
      kpis: '',
      outils: '',
      sector: '',
    }
  });

  const addContrainte = () => {
    setContraintes([...contraintes, '']);
  };

  const removeContrainte = (index: number) => {
    setContraintes(contraintes.filter((_, i) => i !== index));
  };

  const updateContrainte = (index: number, value: string) => {
    const newContraintes = [...contraintes];
    newContraintes[index] = value;
    setContraintes(newContraintes);
  };

  const addObjectif = () => {
    if (objectifs.length < 4) {
      setObjectifs([...objectifs, '']);
    }
  };

  const removeObjectif = (index: number) => {
    if (objectifs.length > 2) {
      setObjectifs(objectifs.filter((_, i) => i !== index));
    }
  };

  const updateObjectif = (index: number, value: string) => {
    const newObjectifs = [...objectifs];
    newObjectifs[index] = value;
    setObjectifs(newObjectifs);
  };

  const handleStep1Submit = (data: any) => {
    setCurrentStep(2);
  };

  const handleGenerateCadrage = async () => {
    if (!cadrageDoc) {
      toast.error('Veuillez sélectionner un document pour générer le cadrage.');
      return;
    }
    
    setCadrageLoading(true);
    try {
      const missionName = step1Form.getValues('name');
      const sector = step2Form.getValues('sector');

      const response = await apiService.generateScope(missionName, sector || '', cadrageDoc);
      
      if (response.status === 'success' && response.data) {
        const scopeData = response.data as ScopeOutput;
        
        step2Form.setValue('context', scopeData[0][1]);
        step2Form.setValue('problem', scopeData[2][1]);
        step2Form.setValue('kpis', scopeData[4][1]);
        step2Form.setValue('outils', scopeData[5][1]);

        setObjectifs(scopeData[3][1].length > 0 ? scopeData[3][1] : ['', '']);
        setContraintes(scopeData[1][1].length > 0 ? scopeData[1][1] : ['']);

        toast.success('Cadrage généré avec succès !');
      } else {
        throw new Error(response.message || 'Échec de la génération du cadrage');
      }
    } catch (error: any) {
      toast.error('Erreur lors de la génération du cadrage: ' + error.message);
      console.error('Error generating cadrage:', error);
    } finally {
      setCadrageLoading(false);
    }
  };

  const handleStep2Submit = async (data: any) => {
    setLoading(true);
    try {
      const step1Data = step1Form.getValues();
      
      const missionData: CreateMissionData = {
        name: step1Data.name,
        context: data.context,
        objectif: objectifs.filter(o => o.trim()), // Send objectives as JSON string
        problem: data.problem,
        contraintes: contraintes.filter(c => c.trim()),
        kpis: data.kpis,
        outils: data.outils,
        user_id: user?.id,
      };

      const response = await apiService.createMission(missionData);
      if (response.status === 'success') {
        onMissionCreated(response.data);
      } else {
        throw new Error(response.message || 'Failed to create mission');
      }
    } catch (error: any) {
      toast.error('Erreur lors de la création de la mission');
      console.error('Error creating mission:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Étape 1: Informations de base
        </h3>
        <Input
          label="Nom de la mission *"
          placeholder="Ex: Étude de marché Afrique de l'Ouest"
          error={step1Form.formState.errors.name?.message}
          {...step1Form.register('name')}
        />
      </div>
      
      <div className="flex justify-end">
        <Button type="submit">
          Suivant
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Étape 2: Cadrage détaillé
        </h3>
        
        <div className="space-y-6">
          {/* Cadrage Document Upload */}
          <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <input
              id="cadrage-doc-upload"
              type="file"
              className="hidden"
              onChange={(e) => setCadrageDoc(e.target.files ? e.target.files[0] : null)}
            />
            <label htmlFor="cadrage-doc-upload" className="cursor-pointer flex flex-col items-center justify-center">
              <UploadCloud className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-3" />
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                {cadrageDoc ? cadrageDoc.name : 'Glissez & déposez votre document ici, ou cliquez pour sélectionner'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                (PDF, DOCX, TXT - Max 5MB)
              </p>
            </label>
            {cadrageDoc && (
              <div className="mt-3 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                <span>{cadrageDoc.name}</span>
                <button
                  type="button"
                  onClick={() => setCadrageDoc(null)}
                  className="ml-2 text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <Input
              label="Secteur (optionnel)"
              placeholder="Ex: Finance, Santé, Technologie"
              className="mt-4"
              {...step2Form.register('sector')}
            />
            <Button
              type="button"
              onClick={handleGenerateCadrage}
              loading={cadrageLoading}
              disabled={!cadrageDoc || cadrageLoading}
              className="mt-4"
            >
              Générer le cadrage
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contexte
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              rows={4}
              maxLength={500}
              placeholder="Décrivez le contexte de la mission..."
              {...step2Form.register('context')}
            />
            <p className="text-xs text-gray-500 mt-1">
              {step2Form.watch('context')?.length || 0}/500 caractères
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contraintes
            </label>
            <div className="space-y-2">
              {contraintes.map((contrainte, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={contrainte}
                    onChange={(e) => updateContrainte(index, e.target.value)}
                    placeholder={`Contrainte ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  {contraintes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContrainte(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addContrainte}
                className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une contrainte</span>
              </button>
            </div>
          </div>

          <Input
            label="Problématique reformulée"
            placeholder="Reformulez la problématique principale..."
            {...step2Form.register('problem')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Objectifs (2-4 objectifs)
            </label>
            <div className="space-y-2">
              {objectifs.map((objectif, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={objectif}
                    onChange={(e) => updateObjectif(index, e.target.value)}
                    placeholder={`Objectif ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  {objectifs.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeObjectif(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {objectifs.length < 4 && (
                <button
                  type="button"
                  onClick={addObjectif}
                  className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un objectif</span>
                </button>
              )}
            </div>
          </div>

          <Input
            label="KPIs"
            placeholder="Indicateurs de performance mesurables..."
            {...step2Form.register('kpis')}
          />

          <Input
            label="Outils"
            placeholder="Outils et méthodologies à utiliser..."
            {...step2Form.register('outils')}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(1)}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>
        <Button type="submit" loading={loading}>
          Créer la mission
        </Button>
      </div>
    </form>
  );

  return (
    <div className="max-w-2xl">
      {/* Progress indicator */}
      <div className="flex items-center mb-6">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          currentStep >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
        }`}>
          1
        </div>
        <div className={`flex-1 h-1 mx-4 ${
          currentStep >= 2 ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
        }`} />
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          currentStep >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
        }`}>
          2
        </div>
      </div>

      {currentStep === 1 ? renderStep1() : renderStep2()}
    </div>
  );
};

export default CreateMissionModal;
