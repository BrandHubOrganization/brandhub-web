import { SimpleSectionEditorPage } from "@/pages/tasks/components/SimpleSectionEditorPage";

const SECTION_KEYS = [
  "KOL.SHORTLIST",
  "KOL.DEAL",
  "KOL.BRIEF",
  "KOL.DRAFT",
  "KOL.REPORT",
];

export default function KolEditorPage() {
  return <SimpleSectionEditorPage sectionKeys={SECTION_KEYS} />;
}
