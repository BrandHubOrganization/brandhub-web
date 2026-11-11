// The editor accepts only a same-origin BrandHub host. Copy UI tokens, never media styles.
export function applyHostAppearance(
	source: Pick<CSSStyleDeclaration, "getPropertyValue">,
	target: Pick<CSSStyleDeclaration, "setProperty">,
) {
	const tokens = {
		background: "background",
		foreground: "foreground",
		card: "card",
		"card-foreground": "card-foreground",
		popover: "popover",
		"popover-foreground": "popover-foreground",
		"popover-hover": "accent",
		primary: "primary",
		"primary-foreground": "primary-foreground",
		secondary: "secondary",
		"secondary-foreground": "secondary-foreground",
		"secondary-border": "border",
		muted: "muted",
		"muted-foreground": "muted-foreground",
		accent: "accent",
		"accent-foreground": "accent-foreground",
		border: "border",
		input: "input",
		ring: "ring",
		destructive: "destructive",
		"destructive-foreground": "destructive-foreground",
		constructive: "success",
		"constructive-foreground": "success-foreground",
		caution: "warning",
		"caution-foreground": "warning-foreground",
		"sidebar-background": "card",
		sidebar: "card",
		"sidebar-foreground": "foreground",
		"sidebar-border": "border",
		"sidebar-primary": "primary",
		"sidebar-primary-foreground": "primary-foreground",
		"sidebar-accent": "accent",
		"sidebar-accent-foreground": "accent-foreground",
		"sidebar-ring": "ring",
	};
	for (const [editorToken, hostToken] of Object.entries(tokens)) {
		const value = source.getPropertyValue(`--${hostToken}`).trim();
		if (value) target.setProperty(`--${editorToken}`, `hsl(${value})`);
	}
	const font = source.getPropertyValue("--font-sans").trim();
	if (font) target.setProperty("--font-sans", font);
}
