/**
 * Statistics Card Component
 * 
 * This component displays key metrics in a card format with an icon,
 * value, and optional change indicator. Used throughout the dashboard
 * to show important KPIs.
 * 
 * Features:
 * - Customizable icon and colors
 * - Change indicators with positive/negative/neutral states
 * - Hover effects and animations
 * - Responsive design
 * - Mobile-optimized layout
 * 
 * Usage:
 * - Used in dashboard to display metrics
 * - Pass icon, value, and change props
 * - Customize colors and change types
 * 
 * Props:
 * - title: The metric title
 * - value: The metric value (formatted)
 * - change: Optional change description
 * - changeType: Type of change (positive/negative/neutral)
 * - icon: Lucide React icon component
 * - iconColor: Background color for icon
 */

import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-sage-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-sage-200 p-4 sm:p-6 hover:shadow-lg hover:shadow-sage-200/20 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-sage-600 mb-2 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-sage-900 mb-1 truncate">{value}</p>
          {change && (
            <p className={`text-xs sm:text-sm font-medium ${getChangeColor()} truncate`}>{change}</p>
          )}
        </div>
        <div className={`p-3 sm:p-4 rounded-2xl ${iconColor} shadow-sm flex-shrink-0 ml-3`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;