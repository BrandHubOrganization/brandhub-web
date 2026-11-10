"use client";

import { Button } from "../ui/button";
import { useRef, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { RenameProjectDialog } from "@/project/components/rename-project-dialog";
import { DeleteProjectDialog } from "@/project/components/delete-project-dialog";
import { useRouter } from "next/navigation";
import { ExportButton } from "./export-button";
import { ThemeToggle } from "../theme-toggle";
import { DEFAULT_LOGO_URL } from "@/site/brand";
import { StudioControls } from "@/brandhub/studio-controls";
import { toast } from "sonner";
import { useEditor } from "@/editor/use-editor";
import {
	CommandIcon,
	Delete02Icon,
	Edit03Icon,
	Logout05Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShortcutsDialog } from "@/actions/components/shortcuts-dialog";
import Image from "next/image";
import { cn } from "@/utils/ui";
import { ArrowLeft, Keyboard, Loader2 } from "lucide-react";

export function EditorHeader() {
	const [shortcutsOpen, setShortcutsOpen] = useState(false);
	const [isExiting, setIsExiting] = useState(false);
	const router = useRouter();
	const editor = useEditor();
	const handleExit = async () => {
		if (isExiting) return;
		setIsExiting(true);
		editor.playback.pause();
		try {
			await editor.save.flush();
			await editor.project.prepareExit();
			editor.project.closeProject();
			router.push("/projects");
		} catch (error) {
			setIsExiting(false);
			toast.error("Chưa thể về thư viện dự án", {
				description:
					error instanceof Error ? error.message : "Vui lòng thử lại.",
			});
		}
	};
	return (
		<header className="bg-background flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b px-3 py-2 lg:flex-nowrap">
			<div className="flex min-w-0 flex-1 items-center gap-2.5">
				<Button
					variant="ghost"
					size="sm"
					className="shrink-0 gap-1 px-2"
					onClick={handleExit}
					disabled={isExiting}
					aria-label="Về thư viện dự án"
					title="Về thư viện dự án"
				>
					{isExiting ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<ArrowLeft className="size-4" />
					)}
					<span className="hidden lg:inline">
						{isExiting ? "Đang lưu…" : "Thư viện"}
					</span>
				</Button>
				<ProjectDropdown onExit={handleExit} isExiting={isExiting} />
				<div className="hidden shrink-0 sm:block">
					<p className="text-sm font-semibold leading-5">
						BrandHub Video Space
					</p>
					<p className="text-muted-foreground text-xs leading-4">
						Không gian làm việc
					</p>
				</div>
				<div className="bg-border mx-1 hidden h-7 w-px shrink-0 sm:block" />
				<EditableProjectName />
			</div>
			<nav
				aria-label="Công cụ dự án"
				className="flex max-w-full flex-wrap items-center gap-2"
			>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setShortcutsOpen(true)}
					aria-label="Phím tắt"
				>
					<Keyboard className="size-4" />
					<span className="hidden xl:inline">Phím tắt</span>
				</Button>
				<StudioControls />
				<ExportButton />
				<ThemeToggle />
			</nav>
			<ShortcutsDialog isOpen={shortcutsOpen} onOpenChange={setShortcutsOpen} />
		</header>
	);
}

function ProjectDropdown({
	onExit,
	isExiting,
}: {
	onExit: () => Promise<void>;
	isExiting: boolean;
}) {
	const [openDialog, setOpenDialog] = useState<
		"delete" | "rename" | "shortcuts" | null
	>(null);
	const router = useRouter();
	const editor = useEditor();
	const activeProject = useEditor((e) => e.project.getActive());

	const handleSaveProjectName = async (newName: string) => {
		if (
			activeProject &&
			newName.trim() &&
			newName !== activeProject.metadata.name
		) {
			try {
				await editor.project.renameProject({
					id: activeProject.metadata.id,
					name: newName.trim(),
				});
			} catch (error) {
				toast.error("Không thể đổi tên dự án", {
					description:
						error instanceof Error ? error.message : "Vui lòng thử lại",
				});
			} finally {
				setOpenDialog(null);
			}
		}
	};

	const handleDeleteProject = async () => {
		if (activeProject) {
			try {
				await editor.project.deleteProjects({
					ids: [activeProject.metadata.id],
				});
				router.push("/projects");
			} catch (error) {
				toast.error("Không thể xóa dự án", {
					description:
						error instanceof Error ? error.message : "Vui lòng thử lại",
				});
			} finally {
				setOpenDialog(null);
			}
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="size-9 shrink-0 rounded-md p-0.5"
						aria-label="Mở menu dự án"
					>
						<Image
							src={DEFAULT_LOGO_URL}
							alt="BrandHub"
							width={32}
							height={32}
							className="size-8"
						/>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="z-100 w-56">
					<DropdownMenuItem
						onClick={onExit}
						disabled={isExiting}
						icon={<HugeiconsIcon icon={Logout05Icon} />}
					>
						{isExiting ? "Đang đóng dự án…" : "Về thư viện dự án"}
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={() => setOpenDialog("rename")}
						icon={<HugeiconsIcon icon={Edit03Icon} />}
					>
						Đổi tên dự án
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={() => setOpenDialog("shortcuts")}
						icon={<HugeiconsIcon icon={CommandIcon} />}
					>
						Phím tắt
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<DropdownMenuItem
						onClick={() => setOpenDialog("delete")}
						variant="destructive"
						icon={<HugeiconsIcon icon={Delete02Icon} />}
					>
						Xóa dự án
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<RenameProjectDialog
				isOpen={openDialog === "rename"}
				onOpenChange={(isOpen) => setOpenDialog(isOpen ? "rename" : null)}
				onConfirm={(newName) => handleSaveProjectName(newName)}
				projectName={activeProject?.metadata.name || ""}
			/>
			<DeleteProjectDialog
				isOpen={openDialog === "delete"}
				onOpenChange={(isOpen) => setOpenDialog(isOpen ? "delete" : null)}
				onConfirm={handleDeleteProject}
				projectNames={[activeProject?.metadata.name || ""]}
			/>
			<ShortcutsDialog
				isOpen={openDialog === "shortcuts"}
				onOpenChange={(isOpen) => setOpenDialog(isOpen ? "shortcuts" : null)}
			/>
		</>
	);
}

function EditableProjectName() {
	const editor = useEditor();
	const activeProject = useEditor((e) => e.project.getActive());
	const [isEditing, setIsEditing] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const originalNameRef = useRef("");

	const projectName = activeProject?.metadata.name || "";

	const startEditing = () => {
		if (isEditing) return;
		originalNameRef.current = projectName;
		setIsEditing(true);

		requestAnimationFrame(() => {
			inputRef.current?.select();
		});
	};

	const saveEdit = async () => {
		if (!inputRef.current || !activeProject) return;
		const newName = inputRef.current.value.trim();
		setIsEditing(false);

		if (!newName) {
			inputRef.current.value = originalNameRef.current;
			return;
		}

		if (newName !== originalNameRef.current) {
			try {
				await editor.project.renameProject({
					id: activeProject.metadata.id,
					name: newName,
				});
			} catch (error) {
				toast.error("Không thể đổi tên dự án", {
					description:
						error instanceof Error ? error.message : "Vui lòng thử lại",
				});
			}
		}
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (!isEditing && (event.key === "Enter" || event.key === " ")) {
			event.preventDefault();
			startEditing();
			return;
		}
		if (event.key === "Enter") {
			event.preventDefault();
			inputRef.current?.blur();
		} else if (event.key === "Escape") {
			event.preventDefault();
			if (inputRef.current) {
				inputRef.current.value = originalNameRef.current;
				inputRef.current.setSelectionRange(0, 0);
			}
			setIsEditing(false);
			inputRef.current?.blur();
		}
	};

	return (
		<input
			ref={inputRef}
			type="text"
			defaultValue={projectName}
			aria-label="Tên dự án"
			title="Nhấn để đổi tên dự án"
			readOnly={!isEditing}
			onClick={startEditing}
			onBlur={saveEdit}
			onKeyDown={handleKeyDown}
			style={{ fieldSizing: "content" }}
			className={cn(
				"h-8 min-w-0 max-w-72 truncate rounded-sm bg-transparent px-2 py-1 text-sm font-medium outline-none cursor-pointer hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring",
				isEditing && "ring-1 ring-ring cursor-text hover:bg-transparent",
			)}
		/>
	);
}
