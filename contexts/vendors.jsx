import { requestHandler } from "@/services/ApiHandler";
import { createVendor, editVendor, getVendors } from "@/services/api";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useModal } from "./modal";

const VendorContext = createContext();

export function useVendors() {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error("useVendors must be used within a ModalProvider");
  }
  return context;
}

export function VendorsProvider({ children }) {
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState([]);
  const { closeModal } = useModal();

  const getVendorsHandler = async () => {
    await requestHandler(
      async () => await getVendors(),
      setIsLoading,
      (data) => setVendors(data.data.output),
      toast.error
    );
  };

  const createVendorHandler = async (data) => {
    await requestHandler(
      async () => await createVendor(data),
      null,
      async (data) => {
        closeModal("add-vendor");
        toast.success("Vendor Added Successfully!");
        await getVendorsHandler();
      },
      toast.error
    );
  };

  const editVendorHandler = async (id, data, modalId) => {
    await requestHandler(
      async () => await editVendor(id, data),
      null,
      async (data) => {
        closeModal(modalId);
        toast.success("Vendor Saved Successfully!");
        await getVendorsHandler();
      },
      toast.error
    );
  };

  useEffect(() => {
    getVendorsHandler();
  }, []);

  return (
    <VendorContext.Provider
      value={{ vendors, createVendorHandler, editVendorHandler, getVendorsHandler }}
    >
      {isLoading ? null : children}
    </VendorContext.Provider>
  );
}
