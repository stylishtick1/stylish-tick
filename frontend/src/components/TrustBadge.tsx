import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TrustBadgeProps {
  Icon: LucideIcon;
  text: string;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ Icon, text }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Icon className="w-4 h-4 text-[#B08D57] flex-shrink-0" />
    <span>{text}</span>
  </div>
);
