import { useState } from "react";
import type { Client, CreateClientDTO, UpdateServicePackageDTO } from "./types/client";
import { CreateEditClientModal } from "./components/CreateEditClientModal";
import { ServicePackageModal } from "./components/ServicePackageModal";
import { DeleteClientModal } from "./components/DeleteClientModal";

interface ClientModalsProps {
  createClient: (dto: CreateClientDTO) => Promise<Client>;
  updateServicePackage: (id: string, dto: UpdateServicePackageDTO) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  isCreateOpen: boolean;
  onCloseCreate: () => void;
  selectedClientForPackage: Client | null;
  onClosePackage: () => void;
  selectedClientForDelete: Client | null;
  onCloseDelete: () => void;
}

export function ClientModals({
  createClient,
  updateServicePackage,
  deleteClient,
  isCreateOpen,
  onCloseCreate,
  selectedClientForPackage,
  onClosePackage,
  selectedClientForDelete,
  onCloseDelete,
}: ClientModalsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async (dto: CreateClientDTO) => {
    setIsSubmitting(true);
    try {
      await createClient(dto);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePackageSubmit = async (id: string, dto: UpdateServicePackageDTO) => {
    setIsSubmitting(true);
    try {
      await updateServicePackage(id, dto);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClientForDelete) return;
    setIsSubmitting(true);
    try {
      await deleteClient(selectedClientForDelete.id);
      onCloseDelete();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CreateEditClientModal
        isOpen={isCreateOpen}
        onClose={onCloseCreate}
        onSubmit={handleCreateSubmit}
        isLoading={isSubmitting}
      />
      <ServicePackageModal
        isOpen={!!selectedClientForPackage}
        client={selectedClientForPackage}
        onClose={onClosePackage}
        onSubmit={handleUpdatePackageSubmit}
        isLoading={isSubmitting}
      />
      <DeleteClientModal
        isOpen={!!selectedClientForDelete}
        clientName={selectedClientForDelete?.name}
        onClose={onCloseDelete}
        onConfirm={handleDeleteConfirm}
        isLoading={isSubmitting}
      />
    </>
  );
}
