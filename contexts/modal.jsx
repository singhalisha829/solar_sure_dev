// import { createContext, useContext, useState } from "react";

// const ModalContext = createContext();

// export function useModal() {
//   return useContext(ModalContext);
// }

// export function ModalProvider({ children }) {
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const openModal = () => setIsModalOpen(true);
//   const closeModal = () => setIsModalOpen(false);

//   return (
//     <ModalContext.Provider value={{ isModalOpen, openModal, closeModal }}>
//       {children}
//     </ModalContext.Provider>
//   );
// }

// ModalContext.js
import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

export function ModalProvider({ children }) {
  const [modals, setModals] = useState({});

  const openModal = (id) => setModals({ ...modals, [id]: true });
  const closeModal = (id) => setModals({ ...modals, [id]: false });
  const isModalOpen = (id) => !!modals[id];

  return (
    <ModalContext.Provider value={{ isModalOpen, openModal, closeModal, modals }}>
      {children}
    </ModalContext.Provider>
  );
}
