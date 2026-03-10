import { requestHandler } from "@/services/ApiHandler";
import {
  createManufacturer,
  getManufacturers,
  editManufacturer,
} from "@/services/api";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useModal } from "./modal";

const ManufacturerContext = createContext();

export function useManufacturers() {
  const context = useContext(ManufacturerContext);
  if (!context) {
    throw new Error("useManufacturers must be used within a ModalProvider");
  }
  return context;
}

export function ManufacturerProvider({ children }) {
  const { closeModal } = useModal();
  const [manufacturers, setManufaturers] = useState([]);
  const [isLoading, setIsLoading] = useState([]);

  const getManufaturerHandler = async () => {
    await requestHandler(
      async () => await getManufacturers(),
      setIsLoading,
      (data) => setManufaturers(data.data.output),
      toast.error
    );
  };

  const createManufacturerHandler = async (data, onSuccess) => {
    await requestHandler(
      async () => await createManufacturer(data),
      null,
      async (data) => {
        closeModal("add-manufacturer");
        toast.success("Manufacturer Added Successfully!");
        if (onSuccess) {
          await onSuccess();
        } else {
          getManufaturerHandler();
        }
      },
      toast.error
    );
  };

  const editManufacturerHandler = async (id, data, modalId, onSuccess) => {
    await requestHandler(
      async () => await editManufacturer(id, data),
      null,
      async (data) => {
        closeModal(modalId);
        toast.success("Manufacturer Saved Successfully");
        if (onSuccess) {
          await onSuccess();
        } else {
          getManufaturerHandler();
        }
      },
      toast.error
    );
  };

  useEffect(() => {
    getManufaturerHandler();
  }, []);

  return (
    <ManufacturerContext.Provider
      value={{
        manufacturers,
        createManufacturerHandler,
        editManufacturerHandler,
      }}
    >
      {children}
    </ManufacturerContext.Provider>
  );
}
