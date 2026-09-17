import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import type { PlanService } from '../../../lib/plans-api';
import { getClientServiceDetailPath } from '../../../lib/individual-services-api';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

type PlanServicesListProps = {
  services: PlanService[];
  className?: string;
};

const INDIVIDUAL_PURCHASE_TOOLTIP = 'Also available for individual purchase';

const labelBase =
  'inline-flex items-center text-[9px] px-2 py-0.5 rounded-full border font-medium whitespace-nowrap';

const PlanServiceItem = ({ service }: { service: PlanService }) => {
  const isClickable = Boolean(service.available_individually);

  if (!isClickable) {
    return (
      <span className={cn(labelBase, 'bg-muted text-foreground border-border/50')}>
        {service.name}
      </span>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={getClientServiceDetailPath(service)}
          className={cn(
            labelBase,
            'bg-[#C4FE01]/10 text-[#C4FE01] border-[#C4FE01]/30 hover:bg-[#C4FE01]/20 transition-colors cursor-pointer',
          )}
        >
          {service.name}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs max-w-[220px]">
        {INDIVIDUAL_PURCHASE_TOOLTIP}
      </TooltipContent>
    </Tooltip>
  );
};

const PlanServicesList = ({ services, className }: PlanServicesListProps) => {
  if (services.length === 0) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn('flex flex-wrap gap-1.5', className)}>
        {services.map((service) => (
          <PlanServiceItem key={service._id} service={service} />
        ))}
      </div>
    </TooltipProvider>
  );
};

export default PlanServicesList;
