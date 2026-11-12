import { SimpleSectionEditorPage } from "@/pages/tasks/components/SimpleSectionEditorPage";

const SECTION_KEYS = [
  "EVENT.AGENDA",
  "EVENT.LOGISTICS",
  "EVENT.PROMOTION",
  "EVENT.RUNSHEET",
  "EVENT.REPORT",
];

export default function EventEditorPage() {
  return <SimpleSectionEditorPage sectionKeys={SECTION_KEYS} />;
}
