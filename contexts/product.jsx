import { requestHandler } from "@/services/ApiHandler";
import {
  createProduct,
  getProducts,
  getUnits,
  getProductType,
  editProduct,
} from "@/services/api";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useModal } from "./modal";

const ProductContext = createContext();

export function useProduct() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
}

export function ProductProvider({ children }) {
  const { closeModal } = useModal();
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [isLoading, setIsLoading] = useState([]);

  const getProductHandler = async (filteredObj = {}) => {
    await requestHandler(
      async () => await getProducts(filteredObj),
      setIsLoading,
      (data) => setProducts(data.data.output),
      toast.error
    );
  };

  const createProductHandler = async (data, onSuccess) => {
    await requestHandler(
      async () => await createProduct(data),
      null,
      async (data) => {
        closeModal("add-product");
        toast.success("Product Added Successfully!");
        if (onSuccess) {
          await onSuccess();
        } else {
          getProductHandler();
        }
      },
      toast.error
    );
  };
  const getUnitsHandler = async (queryParams = {}) => {
    await requestHandler(
      async () => await getUnits(queryParams),
      null,
      (data) => setUnits(data.data.output),
      toast.error
    );
  };

  const editProductHandler = async (id, data, modalId, onSuccess) => {
    await requestHandler(
      async () => await editProduct(id, data),
      null,
      async (data) => {
        closeModal(modalId);
        toast.success("Product Saved Successfully!");
        if (onSuccess) {
          await onSuccess();
        } else {
          getProductHandler();
        }
      },
      toast.error
    );
  };

  const getProductTypesHandler = async () => {
    await requestHandler(
      async () => await getProductType(),
      null,
      (data) => setProductTypes(data.data.output),
      toast.error
    );
  };

  useEffect(() => {
    getUnitsHandler();
    getProductTypesHandler();
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        units,
        productTypes,
        createProductHandler,
        getProductHandler,
        editProductHandler,
        getUnitsHandler,
        isLoading,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}
