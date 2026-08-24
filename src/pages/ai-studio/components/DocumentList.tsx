import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DocumentStatus, KnowledgeDocument } from "../types/knowledgeBase";

const STATUS_BADGE_VARIANT: Record<DocumentStatus, BadgeProps["variant"]> = {
  PROCESSING: "PENDING_REVIEW",
  INDEXED: "PUBLISHED",
  FAILED: "FAILED",
};

export interface DocumentListProps {
  documents: KnowledgeDocument[];
  onDelete: (id: string) => void;
}

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  const { t } = useTranslation();

  if (documents.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        {t("aiStudio.knowledgeBase.noDocuments")}
      </p>
    );
  }

  return (
    <div className="bg-card overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("aiStudio.knowledgeBase.fileName")}</TableHead>
            <TableHead>{t("aiStudio.knowledgeBase.fileType")}</TableHead>
            <TableHead>{t("aiStudio.knowledgeBase.status")}</TableHead>
            <TableHead>{t("aiStudio.knowledgeBase.chunks")}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="text-foreground font-medium">
                {doc.fileName}
              </TableCell>
              <TableCell>{doc.fileType}</TableCell>
              <TableCell>
                <Badge variant={STATUS_BADGE_VARIANT[doc.status]}>
                  {t(`aiStudio.knowledgeBase.docStatus.${doc.status}`)}
                </Badge>
              </TableCell>
              <TableCell>
                {doc.status === "INDEXED" ? (doc.chunksCount ?? 0) : "—"}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => onDelete(doc.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default DocumentList;
