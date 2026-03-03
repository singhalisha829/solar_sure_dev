import { useModal } from "@/contexts/modal";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Input from "../formPage/Input";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import FormModal from "../shared/FormModal";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { useProduct } from "@/contexts/product";
import { getUniqueProducts, getProducts } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";

const StockInProductModal = ({
  modalId,
  onStockInItems,
  itemDetails,
  productList,
  addedItemList = [],
}) => {
  const { closeModal } = useModal();
  const { units, getUnitsHandler } = useProduct();
  const [uniqueProductNames, setUniqueProductName] = useState([]);
  const [products, setProducts] = useState(productList);
  const [item, setItem] = useState({
    product_code: "",
    product_name: "",
    quantity: "",
    unit_id: "",
    unit: "",
    unit_price: "",
    product: "",
  });

  useEffect(() => {
    getUniqueProductList();
  }, []);

  const fetchProductHandler = async (filteredObj = {}) => {
    await requestHandler(
      async () => await getProducts(filteredObj),
      null,
      (data) => {
        let items = [];
        data.data.output.map((item) => {
          if (addedItemList.includes(item.id)) return;
          items.push(item);
        });
        setProducts(items);
      },
      toast.error
    );
  };

  const getUniqueProductList = async () => {
    await requestHandler(
      async () => await getUniqueProducts(),
      null,
      (data) => setUniqueProductName(data.data.output),
      toast.error
    );
  };

  useEffect(() => {
    if (itemDetails && itemDetails !== null) {
      setItem({ ...itemDetails, old_product_code: itemDetails.product_code });
      getUnitsHandler({
        item: itemDetails.product,
      });
    }
  }, [itemDetails]);

  const valueHandler = (e) => {
    setItem((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const addItemHandler = async () => {
    const keysToCheck = {
      product: "Part Name",
      quantity: "Quantity (Value)",
      unit: "Quantity (Unit)",
    };

    const validationResult = checkSpecificKeys(item, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }
    onStockInItems(item);
    closeModal(modalId);
    if (modalId.split("-")[0] === "add") {
      clearForm();
    }
  };

  const clearForm = () => {
    setItem({
      product_code: "",
      product_name: "",
      quantity: "",
      unit: "",
      unit_id: "",
      product: "",
    });
  };

  return (
    <FormModal
      id={modalId}
      onSubmit={addItemHandler}
      className="overflow-visible"
      ctaText={"Stock In"}
      heading={"Stock In Product"}
      onClose={() => {
        if (modalId.split("-")[0] === "add") {
          clearForm();
        }
      }}
    >
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-5">
        <SelectForObjects
          margin={"0px"}
          mandatory
          height={"36px"}
          setselected={(value) => {
            fetchProductHandler({ product_name: [value] });
            setItem({ ...item, product_name: value });
          }}
          selected={item.product_name}
          options={uniqueProductNames}
          optionName={"name"}
          placeholder="Product Name"
          dropdownLabel={"Product Name"}
        />
        <SelectForObjects
          margin={"0px"}
          mandatory
          height={"36px"}
          setselected={(value) => {
            const selected = products.find(
              (product) => product.product_code === value
            );
            setItem((prev) => ({
              ...prev,
              product_name: selected?.name,
              product: selected?.id,
              product_code: selected?.product_code,
              product_description: selected?.description,
            }));
            getUnitsHandler({ item: selected?.id });
          }}
          selected={item.product_code}
          options={products}
          optionName={"product_code"}
          placeholder="Product Id"
          dropdownLabel={"Product Id"}
        />

        <Input
          type="number"
          mandatory
          onChange={valueHandler}
          value={item.quantity}
          name={"quantity"}
          label={"Quantity (Value)"}
          placeholder={"Quantity (Value)"}
        />
        <SelectForObjects
          margin={"0px"}
          height={"36px"}
          mandatory
          setselected={(value) => {
            const selected = units.find((u) => u.symbol === value);
            setItem((prev) => ({
              ...prev,
              unit: value,
              unit_id: selected?.id,
            }));
          }}
          selected={units.find((u) => u.symbol === item.unit)?.symbol}
          options={units}
          optionName={"symbol"}
          placeholder="Unit"
          dropdownLabel={"Quantity (Unit)"}
        />
        <Input
          type="number"
          onChange={valueHandler}
          value={item.unit_price}
          name={"unit_price"}
          label={"Unit Price"}
        />
      </div>
    </FormModal>
  );
};

export default StockInProductModal;
