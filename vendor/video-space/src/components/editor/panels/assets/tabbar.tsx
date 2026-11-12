"use client";

import { TAB_KEYS, tabs, useAssetsPanelStore } from "./assets-panel-store";
import "@/brandhub/resources/resources.css";

export function TabBar() {
	const { activeTab, setActiveTab } = useAssetsPanelStore();
	return (
		<nav className="bh-tools-bar" aria-label="Editor tools">
			{TAB_KEYS.map((key) => {
				const tab = tabs[key];
				return (
					<button
						type="button"
						key={key}
						aria-label={tab.label}
						aria-pressed={activeTab === key}
						onClick={() => setActiveTab(key)}
						className={key === "captions" ? "bh-tool-utility" : undefined}
					>
						<tab.icon />
						<span>{tab.label}</span>
					</button>
				);
			})}
		</nav>
	);
}
