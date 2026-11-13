import { SimpleSectionEditorPage } from "@/pages/tasks/components/SimpleSectionEditorPage";

const SECTION_KEYS = [
  "PRESS.MEDIA_LIST",
  "PRESS.RELEASE",
  "PRESS.CONTACT_LOG",
  "PRESS.COVERAGE",
];

export default function PressEditorPage() {
  return <SimpleSectionEditorPage sectionKeys={SECTION_KEYS} />;
}
