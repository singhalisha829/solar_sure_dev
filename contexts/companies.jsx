import { requestHandler } from "@/services/ApiHandler";
import { createCompany, editCompany, getCompanies } from "@/services/api";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useModal } from "./modal";

const CompanyContext = createContext();

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a ModalProvider");
  }
  return context;
}

export function CompanyProvider({ children }) {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState([]);
  const { closeModal } = useModal();

  const getCompaniesHandler = async () => {
    await requestHandler(
      async () => await getCompanies(),
      setIsLoading,
      (data) => setCompanies(data.data.output),
      toast.error
    );
  };

  const createCompanyHandler = async (data) => {
    await requestHandler(
      async () => await createCompany(data),
      null,
      async (data) => {
        closeModal("add-company");
        toast.success("Company Added Successfully!");
        await getCompaniesHandler();
      },
      toast.error
    );
  };

  const editCompanyHandler = async (id, data, modalId) => {
    await requestHandler(
      async () => await editCompany(id, data),
      null,
      async (data) => {
        closeModal(modalId);
        toast.success("Company Saved Successfully!");
        await getCompaniesHandler();
      },
      toast.error
    );
  };

  useEffect(() => {
    getCompaniesHandler();
  }, []);

  return (
    <CompanyContext.Provider
      value={{
        companies,
        createCompanyHandler,
        editCompanyHandler,
        getCompaniesHandler,
      }}
    >
      {isLoading ? null : children}
    </CompanyContext.Provider>
  );
}
