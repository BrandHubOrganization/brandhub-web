import PageWrapper from "@/components/layout/PageWrapper";
import ContentCalendarPage from "./ContentCalendarPage";

export function CalendarPage() {
  return (
    <PageWrapper
      title="Content Calendar"
      description="Visual, interactive calendar for scheduling and managing posts across all social platforms."
    >
      <ContentCalendarPage />
    </PageWrapper>
  );
}

export default CalendarPage;
