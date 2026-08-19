import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { mockHashtagGroupService } from "@/services/mockHashtagGroupService";
import type { HashtagGroup } from "@/types/hashtagGroup";

export function useHashtagGroups() {
  const [groups, setGroups] = useState<HashtagGroup[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<HashtagGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<HashtagGroup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await mockHashtagGroupService.getGroups(search);
      setGroups(data);
    } catch (err) {
      toast.error("Lỗi khi tải danh sách nhóm Hashtag");
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleOpenCreate = () => {
    setEditingGroup(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (group: HashtagGroup) => {
    setEditingGroup(group);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (payload: {
    name: string;
    hashtags: string[];
  }) => {
    if (editingGroup) {
      await mockHashtagGroupService.updateGroup(editingGroup.id, payload);
      toast.success(`Đã cập nhật nhóm hashtag "${payload.name}"!`);
    } else {
      await mockHashtagGroupService.createGroup(payload);
      toast.success(`Đã tạo mới nhóm hashtag "${payload.name}"!`);
    }
    fetchGroups();
  };

  const handleConfirmDelete = async () => {
    if (!deletingGroup) return;
    setIsDeleting(true);
    try {
      await mockHashtagGroupService.deleteGroup(deletingGroup.id);
      toast.success(`Đã xóa nhóm hashtag "${deletingGroup.name}"!`);
      setDeletingGroup(null);
      fetchGroups();
    } catch (err) {
      toast.error("Lỗi khi xóa nhóm hashtag");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    groups,
    search,
    setSearch,
    isLoading,
    isFormOpen,
    setIsFormOpen,
    editingGroup,
    deletingGroup,
    setDeletingGroup,
    isDeleting,
    handleOpenCreate,
    handleOpenEdit,
    handleFormSubmit,
    handleConfirmDelete,
  };
}
