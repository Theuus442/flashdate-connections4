import { Lock, CheckCircle2 } from 'lucide-react';

interface FinalizedProfileBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Badge component to indicate that a user profile has been finalized
 * Shows a lock icon and "Perfil Consolidado" text
 */
export default function FinalizedProfileBadge({ className = '', size = 'md' }: FinalizedProfileBadgeProps) {
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2
        bg-gradient-to-r from-gold/20 to-gold-dark/20
        border border-gold
        rounded-full
        font-medium text-gold
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <Lock className={`${iconSizes[size]} flex-shrink-0`} />
      <span>Perfil Consolidado</span>
    </div>
  );
}

/**
 * Full card component to show finalized status with more details
 */
export function FinalizedStatusCard() {
  return (
    <div className="bg-gradient-to-br from-gold/10 to-gold-dark/5 border-2 border-gold rounded-2xl p-6 text-center">
      <div className="flex items-center justify-center mb-4">
        <div className="p-3 bg-gold/20 rounded-full">
          <CheckCircle2 className="w-8 h-8 text-gold" />
        </div>
      </div>
      <h3 className="font-serif text-xl font-bold text-foreground mb-2">Seleções Finalizadas</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Seu perfil está consolidado e seus dados não podem mais ser alterados.
      </p>
      <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-medium">
        <Lock className="w-4 h-4" />
        Dados Protegidos
      </div>
    </div>
  );
}
