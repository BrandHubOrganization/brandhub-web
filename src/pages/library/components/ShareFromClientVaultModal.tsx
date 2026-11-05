import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Folder,
  ChevronRight,
  Files,
  Loader2,
  Search,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { materialService } from "@/services/materialService";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

interface Props {
  workspace: string;
  open: boolean;
  onClose: () => void;
}
export function ShareFromClientVaultModal(props: Props) {
  const actor = useAuthStore((state) => state.user?.id);
  return (
    <FolderShare key={`${actor}:${props.workspace}:${props.open}`} {...props} />
  );
}
function normalize(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d");
}
function FolderShare({ workspace, open, onClose }: Props) {
  const { t } = useTranslation();
  const actor = useAuthStore((state) => state.user?.id);
  const workspaces = useWorkspaceStore((state) => state.workspaceList);
  const sources = workspaces.filter(
    (item) => item.id !== workspace && item.myRole === "CLIENT",
  );
  const destination = workspaces.find((item) => item.id === workspace);
  const client = useQueryClient();
  const [source, setSource] = useState("");
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const [folder, setFolder] = useState<string>();
  const [selected, setSelected] = useState<string[]>([]);
  const [shareAll, setShareAll] = useState(false);
  const label = (key: string) => t(`materials.repository.${key}`);
  const sourceWorkspace = sources.find((item) => item.id === source);
  const sourceAllowed = !!sourceWorkspace;
  const matchingSources = sources.filter((item) =>
    normalize(item.name).includes(normalize(workspaceSearch.trim())),
  );
  function changeSource(id: string) {
    setSource(id);
    setFolder(undefined);
    setSelected([]);
    setShareAll(false);
  }
  const query = useQuery({
    queryKey: ["client-vault-share-folders", actor, source, folder],
    enabled: open && !!actor && sourceAllowed,
    queryFn: ({ signal }) =>
      materialService.browse(
        source,
        {
          tab: "CLIENT_VAULT",
          folderId: folder,
          page: 0,
          size: 1,
          search: "",
          deleted: false,
        },
        signal,
      ),
    retry: false,
  });
  const canShareAll =
    !folder &&
    query.isSuccess &&
    !query.data.folders.length &&
    query.data.files.meta.total > 0;
  const sharingAll = shareAll && canShareAll;
  const mutation = useMutation({
    mutationFn: () =>
      materialService.shareClientVaultToWorkspace(
        workspace,
        selected,
        source,
        sharingAll,
      ),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["materials", workspace] });
      toast.success(label("folderShared"));
      onClose();
    },
    onError: () => toast.error(label("failed")),
  });
  const select = (id: string) =>
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((value) => value !== id)
        : [...previous, id],
    );
  const selectionCount = sharingAll
    ? query.data.files.meta.total
    : selected.length;
  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        if (!value && !mutation.isPending) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="h-dvh w-full max-w-full gap-0 overflow-hidden p-0 sm:max-w-[520px]"
        onEscapeKeyDown={(event) => {
          if (mutation.isPending) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (mutation.isPending) event.preventDefault();
        }}
      >
        <SheetHeader className="gap-1.5 p-5 pr-12 text-left">
          <SheetTitle className="text-base leading-snug">
            {label("shareFromVault")}
          </SheetTitle>
          <SheetDescription className="text-xs leading-relaxed">
            {label("zeroCopyNotice")}
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-5">
          {!sourceAllowed ? (
            <section
              className="space-y-3"
              aria-label={label("sourceWorkspace")}
            >
              <Input
                aria-label={label("findWorkspace")}
                placeholder={label("findWorkspace")}
                value={workspaceSearch}
                autoFocus
                iconPrefix={<Search className="size-4" />}
                onChange={(event) => setWorkspaceSearch(event.target.value)}
              />
              <div className="space-y-1">
                {matchingSources.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="h-auto min-h-12 w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-left whitespace-normal"
                    onClick={() => changeSource(item.id)}
                  >
                    <span
                      aria-hidden="true"
                      className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold"
                    >
                      {item.name.charAt(0)}
                    </span>
                    <span className="min-w-0 flex-1 text-sm break-words">
                      {item.name}
                    </span>
                    <ChevronRight className="text-muted-foreground size-4 shrink-0" />
                  </Button>
                ))}
                {!matchingSources.length && (
                  <p
                    role="status"
                    className="text-muted-foreground py-5 text-center text-sm"
                  >
                    {label(
                      sources.length
                        ? "noMatchingWorkspace"
                        : "noSourceWorkspace",
                    )}
                  </p>
                )}
              </div>
            </section>
          ) : (
            <div className="space-y-2">
              <Button
                autoFocus
                variant="ghost"
                size="sm"
                className="text-muted-foreground -ml-2 h-8 gap-1.5 text-xs"
                disabled={mutation.isPending}
                onClick={() => changeSource("")}
              >
                <ArrowLeft className="size-3.5" />
                {label("changeSourceWorkspace")}
              </Button>
              <div className="border-border flex items-center gap-3 rounded-xl border p-3">
                <span
                  aria-hidden="true"
                  className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg font-semibold"
                >
                  {sourceWorkspace.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">
                    {label("takeFilesFrom")}
                  </p>
                  <p className="text-sm font-medium break-words">
                    {sourceWorkspace.name}
                  </p>
                </div>
              </div>
            </div>
          )}
          {sourceAllowed && (
            <section className="space-y-2" aria-label={label("chooseContent")}>
              <h3 className="text-sm font-medium">{label("chooseContent")}</h3>
              {folder && (
                <nav
                  className="flex flex-wrap items-center gap-1 text-xs"
                  aria-label={label("folders")}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={mutation.isPending}
                    onClick={() => setFolder(undefined)}
                  >
                    {label("root")}
                  </Button>
                  {query.data?.breadcrumbs.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      size="sm"
                      disabled={mutation.isPending}
                      onClick={() => setFolder(item.id)}
                    >
                      {item.name}
                    </Button>
                  ))}
                </nav>
              )}
              {query.isPending ? (
                <p
                  role="status"
                  className="text-muted-foreground flex items-center gap-2 py-3 text-sm"
                >
                  <Loader2 className="size-4 animate-spin" />
                  {label("loading")}
                </p>
              ) : query.isError ? (
                <div role="alert" className="text-destructive text-sm">
                  {label("failed")}{" "}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void query.refetch()}
                  >
                    {label("retry")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {query.data?.currentFolder && (
                    <label className="border-border has-checked:border-brand-orange/60 has-checked:bg-brand-orange/5 flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm">
                      <input
                        type="checkbox"
                        className="accent-brand-orange size-4 shrink-0"
                        disabled={mutation.isPending}
                        checked={selected.includes(query.data.currentFolder.id)}
                        onChange={() => select(query.data!.currentFolder!.id)}
                      />
                      <Folder className="text-muted-foreground size-4 shrink-0" />
                      <span className="min-w-0 break-words">
                        {query.data.currentFolder.name}
                      </span>
                    </label>
                  )}
                  {canShareAll && (
                    <label className="border-border has-checked:border-brand-orange/60 has-checked:bg-brand-orange/5 flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm">
                      <input
                        type="checkbox"
                        className="accent-brand-orange size-4 shrink-0"
                        disabled={mutation.isPending}
                        checked={sharingAll}
                        onChange={(event) => {
                          setShareAll(event.target.checked);
                          setSelected([]);
                        }}
                      />
                      <Files className="text-muted-foreground size-5 shrink-0" />
                      <span>
                        {t("materials.repository.shareAllFiles", {
                          count: query.data.files.meta.total,
                        })}
                      </span>
                    </label>
                  )}
                  {!query.data?.folders.length && !canShareAll && !folder && (
                    <p className="text-muted-foreground py-3 text-sm">
                      {label("noSourceFiles")}
                    </p>
                  )}
                  {query.data?.folders.map((item) => (
                    <div
                      key={item.id}
                      className="border-border has-checked:border-brand-orange/60 has-checked:bg-brand-orange/5 flex items-center rounded-xl border"
                    >
                      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 p-3 text-sm">
                        <input
                          type="checkbox"
                          className="accent-brand-orange size-4 shrink-0"
                          disabled={mutation.isPending}
                          checked={selected.includes(item.id)}
                          onChange={() => select(item.id)}
                        />
                        <Folder className="text-muted-foreground size-4 shrink-0" />
                        <span className="min-w-0 break-words">{item.name}</span>
                      </label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-1 shrink-0"
                        disabled={mutation.isPending}
                        aria-label={t("materials.repository.openSourceFolder", {
                          name: item.name,
                        })}
                        onClick={() => setFolder(item.id)}
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
          <div className="bg-muted/50 flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs">
            <span className="text-muted-foreground shrink-0">
              {label("useFilesIn")}
            </span>
            <span className="min-w-0 font-medium break-words">
              {destination?.name ?? workspace}
            </span>
          </div>
        </div>
        <div className="border-border bg-background flex flex-wrap items-center justify-end gap-2 border-t px-5 py-3">
          {sourceAllowed && (
            <span
              aria-live="polite"
              className="text-muted-foreground mr-auto w-full text-xs sm:w-auto"
            >
              {selectionCount > 0
                ? t(
                    `materials.repository.${sharingAll ? "selectedFiles" : "selectedFolders"}`,
                    { count: selectionCount },
                  )
                : label("selectToContinue")}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={mutation.isPending}
            onClick={onClose}
          >
            {label("closeReuse")}
          </Button>
          {sourceAllowed && (
            <Button
              size="sm"
              disabled={
                mutation.isPending ||
                !sourceAllowed ||
                query.isError ||
                (!selected.length && !sharingAll) ||
                selected.length > 100
              }
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {label(mutation.isPending ? "addingFiles" : "useSelectedFiles")}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
