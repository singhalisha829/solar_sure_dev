import React, { useState, useEffect } from "react";
import FormModal from "../shared/FormModal";
import {
  SelectForObjects,
  MultiSelect,
} from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { createBOMTemplates, editBOMTemplates } from "@/services/api";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { toast } from "sonner";
import { LuTrash2 } from "react-icons/lu";
import { getProducts } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { useModal } from "@/contexts/modal";

const AddEditBOMTemplate = ({ modalId, itemDetails, onSuccessfullSubmit }) => {
  const { closeModal } = useModal();
  const [updatedData, setUpdatedData] = useState({});
  const [products, setProducts] = useState([]);
  const [bomDetails, setBomDetails] = useState({
    project_type: "",
    name: "",
    product_list: [],
  });

  const createBOMTemplate = async (data) => {
    await requestHandler(
      async () => await createBOMTemplates(data),
      null,
      async (data) => {
        closeModal("add-bom-template");
        toast.success("BOM Template Added Successfully!");
        onSuccessfullSubmit();
      },
      toast.error
    );
  };

  const editBOMTemplate = async (id, data, modalId) => {
    await requestHandler(
      async () => await editBOMTemplates(id, data),
      null,
      async (data) => {
        closeModal(modalId);
        toast.success("BOM Template Saved Successfully!");
        onSuccessfullSubmit();
      },
      toast.error
    );
  };

  const projectTypes = [
    { name: "Inroof" },
    { name: "Skin Roof" },
    { name: "Conventional" },
  ];

  const nameList = [
    { name: "Electrical" },
    { name: "Mechanical" },
    { name: "Inroof" },
    { name: "Other Structure" },
  ];

  useEffect(() => {
    if (itemDetails && itemDetails !== null) {
      setBomDetails(itemDetails);
      fetchProductHandler({ sections: [itemDetails.name] });
    } else {
      fetchProductHandler();
    }
  }, [itemDetails]);

  const fetchProductHandler = async (filteredObj = {}) => {
    await requestHandler(
      async () => await getProducts(filteredObj),
      null,
      (data) => setProducts(data.data.output),
      toast.error
    );
  };

  const onSubmit = async () => {
    const keysToCheck = {
      name: "Name",
      project_type: "Project Type",
    };

    const validationResult = checkSpecificKeys(bomDetails, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    if (bomDetails.product_list.length === 0) {
      toast.error("Please add at least one Product!");
      return;
    }

    if (modalId.split("-")[0] === "add") {
      const formData = {
        name: bomDetails.name,
        project_type: bomDetails.project_type,
        product_list: bomDetails.product_list.map((product) => product.id),
      };
      await createBOMTemplate(formData);
      clearForm();
    } else {
      let formData = updatedData;
      if (Object.keys(updatedData).includes("product_list")) {
        formData.product_list = updatedData.product_list.map((product) => {
          if (product.inventory) {
            return product.id;
          } else {
            return product.item;
          }
        });
      }
      await editBOMTemplate(itemDetails.id, formData, modalId);
    }
  };

  const handleAddProduct = (entry) => {
    entry.map((product) => {
      if (!product.item_name) {
        product.item_name = product.name;
      }
    });
    setBomDetails({ ...bomDetails, product_list: entry });
    setUpdatedData({ ...updatedData, product_list: entry });
  };

  const handleDeleteProduct = (index) => {
    let list = bomDetails.product_list;
    list.splice(index, 1);
    setBomDetails({ ...bomDetails, product_list: list });
    setUpdatedData({ ...updatedData, product_list: list });
  };

  const handleName = (value) => {
    setBomDetails({ ...bomDetails, name: value });
    setUpdatedData({ ...updatedData, name: value });
    fetchProductHandler({ sections: [value] });
  };

  const clearForm = () => {
    setBomDetails({
      project_type: "",
      name: "",
      product_list: [],
    });
  };

  return (
    <FormModal
      id={modalId}
      heading={
        modalId.split("-")[0] === "add"
          ? "Add BOM Template"
          : "Edit BOM Template"
      }
      className={"overflow-visible"}
      ctaText={modalId.split("-")[0] === "add" ? "Add BOM Template" : "Save"}
      onSubmit={onSubmit}
      onClose={() => {
        if (modalId.split("-")[0] === "add") {
          clearForm();
        }
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <SelectForObjects
          mandatory={true}
          margin={"0px"}
          height={"36px"}
          setselected={(value) => {
            setBomDetails({ ...bomDetails, project_type: value });
            setUpdatedData({ ...updatedData, project_type: value });
          }}
          selected={bomDetails.project_type}
          options={projectTypes}
          optionName={"name"}
          placeholder="Select Project Type"
          dropdownLabel={"Select Project Type"}
        />
        <SelectForObjects
          mandatory={true}
          margin={"0px"}
          height={"36px"}
          setselected={handleName}
          selected={bomDetails.name}
          options={nameList}
          optionName={"name"}
          placeholder="Name"
          dropdownLabel={"Name"}
        />
        <MultiSelect
          options={products}
          mandatory={true}
          optionName="product_code"
          height="36px"
          optionID="id"
          setselected={handleAddProduct}
          selected={bomDetails.product_list}
          dropdownLabel={"Select Product"}
          placeholder="Select Product"
          fontsize="0.75rem"
          margin="0"
          padding="0.35rem 1rem"
        />
      </div>
      {bomDetails.product_list.length > 0 && (
        <div>
          <label className="flex gap-[2px] mb-2 text-xs capitalize text-zinc-800 font-bold tracking-tight">
            Product List
          </label>
          <div className="max-h-[200px] overflow-scroll flex flex-col">
            <table className="text-xs">
              <thead className="sticky top-0 z-[1]">
                <tr className="  text-primary text-left bg-primary-light-10">
                  <th
                    className={`px-4 py-3 text-xs font-semibold uppercase w-[30%]`}
                  >
                    Product Code
                  </th>
                  <th
                    className={`px-4 py-3 text-xs font-semibold uppercase w-[70%]`}
                  >
                    Name
                  </th>
                  <th className={`px-4 py-3 text-xs font-semibold uppercase`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {bomDetails?.product_list.map((prod, index) => {
                  return (
                    <tr key={index}>
                      <td
                        className={`px-4 py-3 font-semibold capitalize w-[30%] text-zinc-600 ${
                          index % 2 != 0 ? "bg-primary-light-5" : "bg-white"
                        } `}
                      >
                        {prod.product_code}
                      </td>
                      <td
                        className={`px-4 py-3 font-semibold capitalize w-[70%] text-zinc-600 ${
                          index % 2 != 0 ? "bg-primary-light-5" : "bg-white"
                        } `}
                      >
                        {prod.item_name}
                      </td>
                      <td
                        className={`px-4 py-3 text-center font-semibold capitalize text-zinc-600 ${
                          index % 2 != 0 ? "bg-primary-light-5" : "bg-white"
                        } `}
                      >
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteProduct(index);
                          }}
                        >
                          <LuTrash2
                            title="Delete"
                            size={12}
                            className="text-stone-300 hover:text-red-500"
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </FormModal>
  );
};

export default AddEditBOMTemplate;
