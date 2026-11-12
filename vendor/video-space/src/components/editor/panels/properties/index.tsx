"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useEditor } from "@/editor/use-editor";
import { useElementSelection } from "@/timeline/hooks/element/use-element-selection";
import { usePropertiesStore } from "./stores/properties-store";
import { getPropertiesConfig } from "./registry";
import { cn } from "@/utils/ui";
import { EmptyView } from "./empty-view";

export function PropertiesPanel() {
	const editor = useEditor();
	useEditor((e) => e.scenes.getActiveSceneOrNull());
	useEditor((e) => e.media.getAssets());
	const { selectedElements } = useElementSelection();
	const { activeTabPerType, setActiveTab } = usePropertiesStore();

	if (selectedElements.length === 0) {
		return (
			<div className="panel bg-background flex h-full flex-col overflow-hidden rounded-sm border">
				<EmptyView />
			</div>
		);
	}

	if (selectedElements.length > 1) {
		return (
			<div className="panel bg-background flex h-full flex-col items-center justify-center overflow-hidden rounded-sm border">
				<p className="text-muted-foreground text-sm">
					{selectedElements.length} elements selected
				</p>
			</div>
		);
	}

	const mediaAssets = editor.media.getAssets();

	const elementsWithTracks = editor.timeline.getElementsWithTracks({
		elements: selectedElements,
	});
	const elementWithTrack = elementsWithTracks[0];

	if (!elementWithTrack) return null;

	const { element, track } = elementWithTrack;
	const config = getPropertiesConfig({ element, mediaAssets });
	const visibleTabs = config.tabs;

	const storedTabId = activeTabPerType[element.type];
	const isStoredTabVisible = visibleTabs.some((t) => t.id === storedTabId);
	const activeTabId = isStoredTabVisible ? storedTabId : config.defaultTab;
	const activeTab =
		visibleTabs.find((t) => t.id === activeTabId) ?? visibleTabs[0];

	if (!activeTab) return null;

	return (
		<div
			className="panel bg-background flex h-full min-w-0 flex-col overflow-hidden rounded-sm border"
			aria-label="Thuộc tính clip"
		>
			<div className="flex h-10 shrink-0 items-center border-b px-3 text-xs font-medium capitalize">
				{element.type}
			</div>
			<div
				className="flex shrink-0 gap-0.5 overflow-x-auto border-b px-2 scrollbar-thin"
				role="tablist"
				aria-label="Clip settings"
			>
				{visibleTabs.map((tab) => (
					<Button
						key={tab.id}
						variant="ghost"
						size="sm"
						role="tab"
						aria-selected={tab.id === activeTab.id}
						onClick={() =>
							setActiveTab({
								elementType: element.type,
								tabId: tab.id,
							})
						}
						aria-label={tab.label}
						className={cn(
							"h-10 shrink-0 rounded-none border-b-2 px-2.5 text-xs",
							tab.id === activeTab.id
								? "border-primary text-primary"
								: "border-transparent text-muted-foreground",
						)}
					>
						{tab.id === "transform" ? "Basic" : tab.label}
					</Button>
				))}
			</div>
			<ScrollArea className="min-h-0 flex-1 scrollbar-hidden">
				{activeTab.content({ trackId: track.id })}
			</ScrollArea>
		</div>
	);
}
