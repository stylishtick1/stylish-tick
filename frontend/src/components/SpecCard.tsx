import React from 'react';

interface SpecCardProps {
  Icon: React.ComponentType<any>;
  title: string;
  description: string;
}

export const SpecCard: React.FC<SpecCardProps> = ({ Icon, title, description }) => (
  <div className="flex items-center gap-3 p-4 rounded-lg border border-border hover:shadow-lg transition-shadow bg-card">
    <Icon className="w-6 h-6 text-[#B08D57] flex-shrink-0" />
    <div className="flex flex-col">
      <span className="text-sm font-medium text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </div>
  </div>
);
