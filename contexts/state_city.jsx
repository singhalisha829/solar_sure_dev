import { requestHandler } from "@/services/ApiHandler";
import { getCity, getSalesPersons, getStates, getVendors } from "@/services/api";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

const StateCityContext = createContext();

export function useStateCity() {
  const context = useContext(StateCityContext);
  if (!context) {
    throw new Error("useStateCity must be used within a ModalProvider");
  }
  return context;
}
export function StateCityProvider({ children }) {
  const [states, setStates] = useState([]);
  const [city, setCity] = useState([]);

  const getStatesHandler = async () => {
    await requestHandler(
      async () => await getStates(),
      null,
      (data) => setStates(data.data.output),
      toast.error
    );
  };

  const getCityHandler = async (id) => {
    await requestHandler(
      async () => await getCity(id),
      null,
      (data) => setCity(data.data.output),
      toast.error
    );
  };
  useEffect(() => {
    getStatesHandler();
  }, []);

  return (
    <StateCityContext.Provider value={{ getCityHandler ,states,city}}>
      {children}
    </StateCityContext.Provider>
  );
}
