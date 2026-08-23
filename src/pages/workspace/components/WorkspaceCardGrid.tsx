import type { Workspace } from "@/types/workspace";

interface Props {
  workspaces: Workspace[];
  onOpen: (workspaceId: string) => void;
}

export function WorkspaceCardGrid({ workspaces, onOpen }: Props) {
  if (workspaces.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {workspaces.map((ws) => (
        <button
          key={ws.id}
          onClick={() => onOpen(ws.id)}
          className="border-border bg-card hover:border-brand-orange/50 flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl border text-left transition-colors"
        >
          <div className="bg-brand-orange h-1.5" />
          <div className="flex-1 space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-brand-orange-soft text-brand-orange flex size-10 items-center justify-center rounded-xl text-sm font-bold">
                {ws.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-foreground text-sm font-bold">{ws.name}</h3>
                <p className="text-muted-foreground font-mono text-3xs tracking-wider uppercase">
                  {ws.slug}
                </p>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
