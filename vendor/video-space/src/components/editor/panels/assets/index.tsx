"use client";

import { useEffect, useState } from "react";
import {
	type Tab,
	useAssetsPanelStore,
} from "@/components/editor/panels/assets/assets-panel-store";
import { Captions } from "@/subtitles/components/assets-view";
import { MediaView } from "./views/assets";
import { SettingsView } from "./views/settings";
import { TabBar } from "./tabbar";
import { EffectsView, FiltersView } from "@/effects/components/assets-view";
import { TransitionsView } from "@/brandhub/transitions/view";
import {
	AudioResourcesView,
	StickerResourcesView,
	TemplatesResourcesView,
	TextResourcesView,
} from "@/brandhub/resources/view";

export function AssetsPanel() {
	const { activeTab, setActiveTab } = useAssetsPanelStore();
	const [importRequest, setImportRequest] = useState(0);
	useEffect(() => {
		const openImport = () => {
			setActiveTab("media");
			setImportRequest((value) => value + 1);
		};
		window.addEventListener("brandhub:import-media", openImport);
		return () =>
			window.removeEventListener("brandhub:import-media", openImport);
	}, [setActiveTab]);

	const viewMap: Record<Tab, React.ReactNode> = {
		media: (
			<MediaView
				importRequest={importRequest}
				onImportHandled={() => setImportRequest(0)}
			/>
		),
		sounds: <AudioResourcesView />,
		text: <TextResourcesView />,
		stickers: <StickerResourcesView />,
		effects: <EffectsView />,
		filters: <FiltersView />,
		transitions: <TransitionsView />,
		templates: <TemplatesResourcesView />,
		captions: <Captions />,
		settings: <SettingsView />,
	};

	return (
		<div
			className="panel bg-background flex h-full flex-col rounded-sm border overflow-hidden"
			aria-label="Tài nguyên dựng video"
		>
			<TabBar />
			<div className="min-h-0 flex-1 overflow-hidden">{viewMap[activeTab]}</div>
		</div>
	);
}
