import { useEditor } from "@/editor/use-editor";

export function EmptyView() {
	const project = useEditor((editor) => editor.project.getActiveOrNull());
	if (!project) return null;
	const { canvasSize, fps } = project.settings;
	const details = [
		["Name", project.metadata.name],
		["Resolution", `${canvasSize.width} × ${canvasSize.height}`],
		["Frame rate", `${(fps.numerator / fps.denominator).toFixed(2)} fps`],
		["Working copy", "Local · auto-saved"],
	];
	return (
		<div className="bg-background flex h-full flex-col">
			<h2 className="flex h-10 shrink-0 items-center border-b px-3 text-xs font-medium">
				Details
			</h2>
			<dl className="grid grid-cols-[90px_minmax(0,1fr)] gap-x-3 gap-y-5 p-4 text-xs">
				{details.map(([label, value]) => (
					<div key={label} className="contents">
						<dt className="text-muted-foreground">{label}</dt>
						<dd className="break-words">{value}</dd>
					</div>
				))}
			</dl>
			<p className="mx-4 border-t pt-4 text-xs leading-5 text-muted-foreground">
				Chọn clip trên timeline để chỉnh hình ảnh, âm thanh hoặc tốc độ.
			</p>
		</div>
	);
}
