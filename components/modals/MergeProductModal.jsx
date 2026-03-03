import { useState } from "react";
import FormModal from "../shared/FormModal";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { mergeProducts } from "@/services/api";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { toast } from "sonner";
import { requestHandler } from "@/services/ApiHandler";
import { useModal } from "@/contexts/modal";

const MergeProducts = ({ modalId, productList, onSuccessfullSubmit }) => {
  const { closeModal } = useModal();
  const [formData, setFormData] = useState({
    source_id: "",
    source_name: "",
    source_unit: "",
    target_id: "",
    target_name: "",
    target_unit: "",
  });

  const onSubmit = async () => {
    const keysToCheck = {
      source_id: "Source Product",
      target_id: "Target Product",
    };
    const validationResult = checkSpecificKeys(formData, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    if (formData.source_id == formData.target_id) {
      toast.error(
        "The source product must differ from the target product. Please try again."
      );
      return;
    }

    if (formData.source_unit != formData.target_unit) {
      toast.error(
        "The source product must belong to same unit category as the target product. Please try again."
      );
      return;
    }

    const apiData = {
      activity: "merge",
      source_id: formData.source_id,
      target_id: formData.target_id,
    };

    await requestHandler(
      async () => await mergeProducts(apiData),
      null,
      async (data) => {
        toast.success("Products Merged Successfully...");
        onSuccessfullSubmit();
        clearForm();
        closeModal(modalId);
      },
      toast.error
    );
  };

  const clearForm = () => {
    setFormData({
      source_id: "",
      source_name: "",
      source_unit: "",
      target_id: "",
      target_name: "",
      target_unit: "",
    });
  };

  return (
    <FormModal
      id={modalId}
      className={"overflow-visible"}
      ctaText={"Submit"}
      heading={"Merge Products"}
      onSubmit={onSubmit}
      onClose={clearForm}
    >
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 p-2">
        <SelectForObjects
          mandatory={true}
          margin={"0px"}
          height={"36px"}
          setselected={(value, id) => {
            const c = productList.find((product) => product.id == id);
            setFormData((prev) => ({
              ...prev,
              source_id: Number(c.id),
              source_name: `${c.product_code}(${c.name})`,
              source_unit: c.inventory_unit_id,
            }));
          }}
          selected={formData.source_name}
          dropdownType={"product_list"}
          productDescriptionKey={"name"}
          optionName={"product_code"}
          optionID={"id"}
          placeholder="Product Code(Product Name)"
          options={productList}
          dropdownLabel={"Source Product"}
        />

        <SelectForObjects
          mandatory={true}
          margin={"0px"}
          height={"36px"}
          setselected={(value, id) => {
            const c = productList.find((product) => product.id == id);
            setFormData((prev) => ({
              ...prev,
              target_id: Number(c.id),
              target_name: `${c.product_code}(${c.name})`,
              target_unit: c.inventory_unit_id,
            }));
          }}
          selected={formData.target_name}
          options={productList}
          dropdownType={"product_list"}
          productDescriptionKey={"name"}
          optionName={"product_code"}
          optionID={"id"}
          placeholder="Product Code(Product Name)"
          dropdownLabel={"Target Product"}
        />
      </div>
    </FormModal>
  );
};

export default MergeProducts;
