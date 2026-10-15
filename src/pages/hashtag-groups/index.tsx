import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { HashtagCollection } from "@/pages/hashtag-groups/components/HashtagCollection";

export function HashtagGroupsPage() {
  const { t } = useTranslation();
  return (
    <PageWrapper
      title={t("hashtagGroups.collection.title")}
      description={t("hashtagGroups.collection.description")}
    >
      <HashtagCollection />
    </PageWrapper>
  );
}
export default HashtagGroupsPage;
