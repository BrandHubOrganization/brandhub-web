import { Switch } from "@/components/ui/switch";

export interface ToggleRowProps {
  label: string;
  value: boolean;
  onToggle: () => void;
}

export function ToggleRow({ label, value, onToggle }: ToggleRowProps) {
  return (
    <div className="border-border/60 flex items-center justify-between border-b py-2.5 last:border-b-0">
      <span className="text-foreground text-xs font-medium">{label}</span>
      <Switch checked={value} onCheckedChange={onToggle} />
    </div>
  );
}

export default ToggleRow;
