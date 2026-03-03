import { useState, useEffect } from "react";
import { useProduct } from "@/contexts/product";
import { useManufacturers } from "@/contexts/manufacturers";
import Input from "../formPage/Input";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import FormModal from "../shared/FormModal";
import { handleFileUpload } from "@/utils/documentUploadHandler";
import { toast } from "sonner";
import { FaEye } from "react-icons/fa";
import { checkSpecificKeys } from "@/utils/formValidationHandler";

const AddEditProduct = ({ modalId, itemDetails }) => {
  const { units, createProductHandler, productTypes, editProductHandler } =
    useProduct();
  const { manufacturers } = useManufacturers();
  const [product, setProduct] = useState({
    name: "",
    product_code: "",
    power_rating: "",
    description: "",
    type: "",
    hsn_code: "",
    gst_rate: "",
    manufacturer: "",
    data_sheet: "",
    left_inventory_after_booking: { unit: "", quantity: 0 },
    booked_inventory: { unit: "", quantity: 0 },
    inventory: { unit: "", quantity: 0 },
    sections: "",
  });
  const [updatedData, setUpdatedData] = useState({});

  const sectionList = [
    { name: "Inverter" },
    { name: "Panel" },
    { name: "Electrical" },
    { name: "Mechanical" },
    { name: "Inroof" },
    { name: "Other Structure" },
    { name: "other" },
  ];

  useEffect(() => {
    if (itemDetails && itemDetails !== null) {
      setProduct(itemDetails);
    }
  }, [itemDetails]);

  const valueHandler = (e) => {
    setProduct((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setUpdatedData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async () => {
    const keysToCheck = {
      name: "Name",
      product_code: "Product Code",
      sections: "Section",
      power_rating: "Power Rating",
      type: "Product Type",
      gst_rate: "GST Rate",
    };

    const validationResult = checkSpecificKeys(product, keysToCheck);

    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    if (!product.inventory.unit || product.inventory.unit === "") {
      toast.error("Field Unit of Measurement is empty");
      return;
    }

    if (modalId.split("-")[0] === "add") {
      await createProductHandler(product);
    } else {
      await editProductHandler(itemDetails.id, updatedData, modalId);
    }
  };

  const fileHandler = async (e) => {
    const response = await handleFileUpload(e.target.files[0]);
    if (response.type === "success") {
      setProduct({ ...product, data_sheet: response.data });
      setUpdatedData({ ...updatedData, data_sheet: response.data });
    } else {
      toast.error(response.error || "Oops! Something went wrong");
    }
  };

  const onClearForm = () => {
    setProduct({
      name: "",
      product_code: "",
      power_rating: "",
      description: "",
      type: "",
      hsn_code: "",
      gst_rate: "",
      manufacturer: "",
      data_sheet: "",
      left_inventory_after_booking: { unit: "", quantity: 0 },
      booked_inventory: { unit: "", quantity: 0 },
      inventory: { unit: "", quantity: 0 },
      sections: "",
    });
  };

  return (
    <FormModal
      id={modalId}
      ctaText={modalId.split("-")[0] === "add" ? "Add Product" : "Save"}
      heading={modalId.split("-")[0] === "add" ? "Add Product" : "Edit Product"}
      onSubmit={onSubmit}
      onClose={() => {
        if (modalId.split("-")[0] === "add") {
          onClearForm();
        }
      }}
    >
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 overflow-scroll p-2">
        <Input
          type={"text"}
          mandatory={true}
          onChange={valueHandler}
          value={product.name}
          name={"name"}
          label={"Product Name"}
        />
        <Input
          type={"text"}
          mandatory={true}
          onChange={valueHandler}
          value={product.product_code}
          name={"product_code"}
          label={"product Code"}
        />
        <SelectForObjects
          mandatory={true}
          margin={"0px"}
          height={"36px"}
          setselected={(value) => {
            setProduct((prev) => ({
              ...prev,
              sections: value,
            }));
            setUpdatedData((prev) => ({
              ...prev,
              sections: value,
            }));
          }}
          selected={product.sections}
          options={sectionList}
          optionName={"name"}
          placeholder="Select Section"
          dropdownLabel={"Select Section"}
        />

        <Input
          type={"number"}
          mandatory={true}
          onChange={valueHandler}
          value={product.power_rating}
          name={"power_rating"}
          label={"power rating"}
        />

        <SelectForObjects
          margin={"0px"}
          height={"36px"}
          mandatory={true}
          setselected={(value) => {
            const selectedOption = units.find((unit) => unit.name == value);
            setProduct((prev) => ({
              ...prev,
              left_inventory_after_booking: {
                unit: selectedOption.symbol,
                quantity: 0,
              },
              booked_inventory: { unit: selectedOption.symbol, quantity: 0 },
              inventory: { unit: selectedOption.symbol, quantity: 0 },
            }));
            setUpdatedData((prev) => ({
              ...prev,
              left_inventory_after_booking: {
                unit: selectedOption.symbol,
                quantity: 0,
              },
              booked_inventory: { unit: selectedOption.symbol, quantity: 0 },
              inventory: { unit: selectedOption.symbol, quantity: 0 },
            }));
          }}
          selected={
            units.find((unit) => unit.symbol === product?.inventory.unit)?.name
          }
          options={units}
          optionName={"name"}
          placeholder="Select Unit"
          dropdownLabel={"Select Unit of Measurement"}
        />

        <SelectForObjects
          margin={"0px"}
          height={"36px"}
          setselected={(value) => {
            const selectedOption = manufacturers.find(
              (manufacturer) => manufacturer.name === value
            );
            setProduct((prev) => ({
              ...prev,
              manufacturer: selectedOption.id,
            }));
            setUpdatedData((prev) => ({
              ...prev,
              manufacturer: selectedOption.id,
            }));
          }}
          selected={
            manufacturers.find(
              (manufacturer) => manufacturer.id === product?.manufacturer
            )?.name
          }
          options={manufacturers}
          optionName={"name"}
          placeholder="Select Manufacturer"
          dropdownLabel={"Select Manufacturer"}
        />

        <SelectForObjects
          mandatory={true}
          margin={"0px"}
          height={"36px"}
          setselected={(value) => {
            const selectedOption = productTypes.find(
              (type) => type.name === value
            );
            setProduct((prev) => ({
              ...prev,
              type: Number(selectedOption.id),
            }));
            setUpdatedData((prev) => ({
              ...prev,
              type: Number(selectedOption.id),
            }));
          }}
          selected={productTypes.find((type) => type.id == product?.type)?.name}
          options={productTypes}
          optionName={"name"}
          placeholder="Select Product Type"
          dropdownLabel={"Select Product Type"}
        />
        <Input
          type={"text"}
          onChange={valueHandler}
          value={product.hsn_code}
          name={"hsn_code"}
          label={"product hsn Code"}
        />
        <Input
          type="number"
          mandatory={true}
          onChange={valueHandler}
          value={product.gst_rate}
          name={"gst_rate"}
          label={"product gst rate"}
        />

        <span className="w-full flex gap-2 items-end">
          <Input
            type="file"
            onChange={fileHandler}
            name={"data_sheet"}
            label={"Upload Datasheet/Drawing"}
          />
          {product.data_sheet && product.data_sheet !== "" && (
            <FaEye
              size={15}
              className="cursor-pointer mb-3"
              onClick={() => window.open(product.data_sheet, "__blank")}
            />
          )}
        </span>

        <Input
          type={"text"}
          onChange={valueHandler}
          value={product.description}
          name={"description"}
          label={"product Description"}
        />
      </div>
    </FormModal>
  );
};

export default AddEditProduct;
