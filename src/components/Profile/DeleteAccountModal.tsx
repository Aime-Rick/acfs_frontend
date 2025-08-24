import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Button from '../UI/Button';

interface DeleteAccountModalProps {
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ onConfirm, onClose, isLoading }) => {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
      </div>
      <div className="mt-3 text-center sm:mt-5">
        <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white" id="modal-title">
          Supprimer votre compte ?
        </h3>
        <div className="mt-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Êtes-vous absolument sûr ? Cette action est irréversible et entraînera la suppression définitive de toutes vos données.
          </p>
        </div>
      </div>
      <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          type="button"
          variant="primary" /* Changed to primary */
          onClick={onConfirm}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Suppression...
            </>
          ) : (
            'Oui, supprimer mon compte'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="w-full"
        >
          Annuler
        </Button>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
