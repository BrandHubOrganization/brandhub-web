import * as React from "react";
import { showToast, type ToastOptions } from "./toast";

export function useToast() {
  const toast = React.useCallback((options: ToastOptions) => {
    return showToast(options);
  }, []);

  return {
    toast,
    success: React.useCallback((title?: string, description?: string) => 
      showToast({ title, description, variant: "success" }), []),
    error: React.useCallback((title?: string, description?: string) => 
      showToast({ title, description, variant: "error" }), []),
    warning: React.useCallback((title?: string, description?: string) => 
      showToast({ title, description, variant: "warning" }), []),
    info: React.useCallback((title?: string, description?: string) => 
      showToast({ title, description, variant: "info" }), []),
  };
}
