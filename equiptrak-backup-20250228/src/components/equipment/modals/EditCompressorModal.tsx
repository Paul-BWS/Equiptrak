import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CompressorRecord } from "@/types/database/compressors";
import { EditCompressorForm } from "./forms/EditCompressorForm";

interface EditCompressorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: CompressorRecord;
}

export function EditCompressorModal({
  open,
  onOpenChange,
  record,
}: EditCompressorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Compressor</DialogTitle>
          <DialogDescription className="text-sm">
            Update the compressor details below. Required fields are marked with an asterisk (*).
          </DialogDescription>
        </DialogHeader>
        <EditCompressorForm
          compressor={record}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 