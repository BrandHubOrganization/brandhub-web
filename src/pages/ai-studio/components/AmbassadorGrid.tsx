import type { Ambassador } from "../types/ambassador";
import { AmbassadorCard } from "./AmbassadorCard";

export interface AmbassadorGridProps {
  ambassadors: Ambassador[];
  onGenerateVideo: (ambassador: Ambassador) => void;
  onDelete: (id: string) => void;
}

export function AmbassadorGrid({
  ambassadors,
  onGenerateVideo,
  onDelete,
}: AmbassadorGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ambassadors.map((ambassador) => (
        <AmbassadorCard
          key={ambassador.id}
          ambassador={ambassador}
          onGenerateVideo={onGenerateVideo}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default AmbassadorGrid;
