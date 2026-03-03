import { requestHandler } from "@/services/ApiHandler";
import { getSalesPersons } from "@/services/api";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

const salesPersonContext = createContext();

export function useSalesPerson() {
  const context = useContext(salesPersonContext);
  if (!context) {
    throw new Error("useSalesPerson must be used within a ModalProvider");
  }
  return context;
}

export function SalesPersonProvider({ children }) {
  const [salesPersons, setSalesPersons] = useState([]);
  const [isLoading, setIsLoading] = useState([]);

  const getSalesPersonsHandler = async () => {
    await requestHandler(
      async () => await getSalesPersons(),
      setIsLoading,
      (data) => setSalesPersons(data.data.output),
      toast.error
    );
  };
  useEffect(() => {
    getSalesPersonsHandler();
  }, []);

  return (
    <salesPersonContext.Provider value={{ salesPersons }}>
      {children}
    </salesPersonContext.Provider>
  );
}
