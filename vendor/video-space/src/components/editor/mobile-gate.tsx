import { scopeStorageName } from "@/platform/storage-scope";
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { getHostContext, subscribeHostContext } from "@/platform/host";
import { Button } from "../ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";

const STORAGE_KEY = scopeStorageName("mobile-acknowledged");

interface MobileGateProps {
	children: React.ReactNode;
}

export function MobileGate({ children }: MobileGateProps) {
	const router = useRouter();
	const { locale } = useSyncExternalStore(subscribeHostContext, getHostContext);
	const english = locale === "en";
	const [show, setShow] = useState<boolean | null>(null);

	useEffect(() => {
		const isMobile = window.innerWidth < 1024;
		const acknowledged = localStorage.getItem(STORAGE_KEY) === "true";
		setShow(isMobile && !acknowledged);
	}, []);

	if (show === null) return null;
	if (!show) return <>{children}</>;

	const handleContinue = () => {
		localStorage.setItem(STORAGE_KEY, "true");
		setShow(false);
	};

	const handleGoBack = () => {
		router.push("/projects");
	};

	return (
		<div className="bg-background relative flex h-screen w-screen flex-col overflow-hidden">
			<Button
				variant="text"
				className="absolute top-6 left-6 flex items-center gap-1 text-muted-foreground"
				onClick={handleGoBack}
			>
				<HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
				<span className=" text-sm">{english ? "Project library" : "Thư viện bản dựng"}</span>
			</Button>

			<div className="flex flex-1 flex-col justify-center gap-5 px-7">
				<div className="flex flex-col gap-3">
					<h1 className="text-foreground text-3xl font-bold tracking-tight">
						{english ? "A desktop screen is recommended" : "Nên dùng màn hình máy tính"}
					</h1>
					<p className="text-muted-foreground text-sm leading-relaxed">
						{english ? "Use a desktop browser for the full timeline and editing controls. Your project remains available in your workspace."
							: "Dùng trình duyệt trên máy tính để thao tác đầy đủ với timeline và công cụ dựng. Bản dựng vẫn được giữ trong không gian làm việc."}
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Button onClick={handleContinue}>{english ? "Continue" : "Tiếp tục"}</Button>
					<Button variant="ghost" onClick={handleGoBack}>
							{english ? "Project library" : "Thư viện bản dựng"}
							<HugeiconsIcon icon={ArrowRight01Icon} size={14} />
					</Button>
				</div>
			</div>
		</div>
	);
}
