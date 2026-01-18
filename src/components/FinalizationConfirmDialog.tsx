import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Lock, AlertTriangle } from 'lucide-react';

interface FinalizationConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  matchCount?: number;
  friendshipCount?: number;
}

/**
 * Dialog to confirm finalization of user selections
 * Once confirmed, the user's profile and votes become read-only
 */
export default function FinalizationConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  matchCount = 0,
  friendshipCount = 0,
}: FinalizationConfirmDialogProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleConfirm = () => {
    if (agreedToTerms) {
      setAgreedToTerms(false);
      onConfirm();
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setAgreedToTerms(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gold/20 rounded-full">
              <Lock className="w-6 h-6 text-gold" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-2xl font-serif">
            Finalizar Seleção?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Esta ação é irreversível. Após a confirmação, seus dados não poderão ser modificados.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Summary of selections */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-sm text-foreground mb-3">Seu resumo de seleções:</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background rounded border border-border p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Matches</p>
              <p className="text-2xl font-bold text-gold">
                {matchCount}
                <span className="text-lg ml-1">💕</span>
              </p>
            </div>
            <div className="bg-background rounded border border-border p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Amizade</p>
              <p className="text-2xl font-bold text-secondary">
                {friendshipCount}
                <span className="text-lg ml-1">👥</span>
              </p>
            </div>
          </div>
        </div>

        {/* Warning details */}
        <div className="space-y-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900 dark:text-amber-100">
              <p className="font-semibold mb-2">Depois de confirmar:</p>
              <ul className="space-y-1 text-xs">
                <li>✗ Você não poderá alterar suas seleções</li>
                <li>✗ Seu perfil será travado (somente leitura)</li>
                <li>✗ Você receberá um badge "Perfil Consolidado"</li>
                <li>✓ Apenas resultados de matches serão visíveis</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Agreement checkbox */}
        <label className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            disabled={isLoading}
            className="w-5 h-5 rounded border-2 border-gold mt-0.5 accent-gold cursor-pointer disabled:opacity-50"
          />
          <span className="text-sm text-foreground flex-1">
            Entendo que minhas seleções serão finalizadas e não poderão ser alteradas
          </span>
        </label>

        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-3">
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!agreedToTerms || isLoading}
            className="bg-gold hover:bg-gold-dark text-gold-dark hover:text-gold-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Finalizando...' : 'Sim, Finalizar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
