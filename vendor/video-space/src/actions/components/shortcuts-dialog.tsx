"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	type KeyboardShortcut,
	useKeyboardShortcutsHelp,
} from "@/actions/use-keyboard-shortcuts-help";
import { useKeybindingsStore } from "@/actions/keybindings-store";
import { Button } from "@/components/ui/button";
import {
	SHORTCUT_PROFILES,
	isShortcutProfile,
} from "@/actions/keybindings/profiles";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export function ShortcutsDialog({
	isOpen,
	onOpenChange,
}: {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [recordingShortcut, setRecordingShortcut] =
		useState<KeyboardShortcut | null>(null);

	const {
		updateKeybinding,
		removeKeybinding,
		getKeybindingString,
		validateKeybinding,
		getKeybindingsForAction,
		setIsRecording,
		resetToDefaults,
		isRecording,
		profile,
		setProfile,
		isCustomized,
	} = useKeybindingsStore();

	const { shortcuts } = useKeyboardShortcutsHelp();

	const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

	useEffect(() => {
		if (!isRecording || !recordingShortcut) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (e.key === "Escape") {
				setIsRecording(false);
				setRecordingShortcut(null);
				return;
			}

			const keyString = getKeybindingString(e);
			if (keyString) {
				const conflict = validateKeybinding({
					key: keyString,
					action: recordingShortcut.action,
				});
				if (conflict) {
					toast.error(
						`Key "${keyString}" is already bound to "${conflict.existingAction}"`,
					);
					setRecordingShortcut(null);
					setIsRecording(false);
					return;
				}

				const oldKeys = getKeybindingsForAction(recordingShortcut.action);
				for (const key of oldKeys) {
					removeKeybinding(key);
				}

				updateKeybinding({
					key: keyString,
					action: recordingShortcut.action,
				});

				setIsRecording(false);
				setRecordingShortcut(null);
			}
		};

		const handleClickOutside = () => {
			setRecordingShortcut(null);
			setIsRecording(false);
		};

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("click", handleClickOutside);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("click", handleClickOutside);
		};
	}, [
		recordingShortcut,
		getKeybindingString,
		updateKeybinding,
		removeKeybinding,
		validateKeybinding,
		getKeybindingsForAction,
		setIsRecording,
		isRecording,
	]);

	const handleStartRecording = (shortcut: KeyboardShortcut) => {
		setRecordingShortcut(shortcut);
		setIsRecording(true);
	};
	const handleOpenChange = (open: boolean) => {
		setIsRecording(false);
		setRecordingShortcut(null);
		onOpenChange(open);
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className="flex max-h-[80vh] max-w-2xl flex-col p-0">
				<DialogHeader>
					<DialogTitle>Keyboard shortcuts</DialogTitle>
				</DialogHeader>

				<DialogBody className="scrollbar-thin grow overflow-y-auto">
					<div className="flex items-center justify-between gap-4">
						<span id="shortcut-profile-label" className="text-sm">
							Shortcut profile{isCustomized ? " · Custom" : ""}
						</span>
						<Select
							value={profile}
							disabled={isRecording}
							onValueChange={(value) => {
								if (isShortcutProfile(value)) setProfile(value);
							}}
						>
							<SelectTrigger aria-labelledby="shortcut-profile-label">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(SHORTCUT_PROFILES).map(([id, label]) => (
									<SelectItem key={id} value={id}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<p className="text-muted-foreground text-xs">
						Custom shortcuts are saved separately for each profile. Shortcuts
						pause while typing or while a dialog is open. Press Esc to cancel
						recording.
					</p>
					{profile === "capcut-windows" && (
						<p className="text-muted-foreground text-xs">
							CapCut-style keys for supported editor actions. P toggles the main
							track magnet; V enables/deactivates selected clips. Browser or
							Windows shortcuts can take priority; use the matching buttons if
							needed.
						</p>
					)}
					<div className="flex flex-col gap-6">
						{categories.map((category) => (
							<div key={category} className="flex flex-col gap-1">
								<h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
									{category}
								</h3>
								<div className="flex flex-col gap-1">
									{shortcuts
										.filter((shortcut) => shortcut.category === category)
										.map((shortcut) => (
											<ShortcutItem
												key={shortcut.action}
												shortcut={shortcut}
												isRecording={
													shortcut.action === recordingShortcut?.action
												}
												onStartRecording={() => handleStartRecording(shortcut)}
											/>
										))}
								</div>
							</div>
						))}
					</div>
				</DialogBody>
				<DialogFooter>
					<Button variant="destructive" onClick={resetToDefaults}>
						Reset {SHORTCUT_PROFILES[profile]} shortcuts
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function ShortcutItem({
	shortcut,
	isRecording,
	onStartRecording,
}: {
	shortcut: KeyboardShortcut;
	isRecording: boolean;
	onStartRecording: (params: { shortcut: KeyboardShortcut }) => void;
}) {
	const displayKeys = shortcut.keys.filter((key: string) => {
		if (
			key.includes("Cmd") &&
			shortcut.keys.includes(key.replace("Cmd", "Ctrl"))
		)
			return false;

		return true;
	});

	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-3">
				{shortcut.icon && (
					<div className="text-muted-foreground">{shortcut.icon}</div>
				)}
				<span className="text-sm">{shortcut.description}</span>
			</div>
			<div className="flex items-center gap-2">
				{displayKeys.length === 0 && (
					<EditableShortcutKey
						isRecording={isRecording}
						onStartRecording={() => onStartRecording({ shortcut })}
					>
						{isRecording ? "Press keys…" : "Assign"}
					</EditableShortcutKey>
				)}
				{displayKeys.map((key: string, index: number) => (
					<div key={key} className="flex items-center gap-2">
						<div className="flex items-center gap-1">
							{key.split("+").map((keyPart: string, partIndex: number) => {
								const keyId = `${shortcut.id}-${index}-${partIndex}`;
								return (
									<EditableShortcutKey
										key={keyId}
										isRecording={isRecording}
										onStartRecording={() => onStartRecording({ shortcut })}
									>
										{keyPart}
									</EditableShortcutKey>
								);
							})}
						</div>
						{index < displayKeys.length - 1 && (
							<span className="text-muted-foreground text-xs">or</span>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

function EditableShortcutKey({
	children,
	isRecording,
	onStartRecording,
}: {
	children: React.ReactNode;
	isRecording: boolean;
	onStartRecording: () => void;
}) {
	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onStartRecording();
	};

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={handleClick}
			title={
				isRecording ? "Press any key combination..." : "Click to edit shortcut"
			}
		>
			{children}
		</Button>
	);
}
