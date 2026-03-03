import { useState, useEffect } from "react";
import Input from "../../formPage/Input";
import { SelectForObjects } from "../../formPage/MultiSelectDropdown/MultiSelectDropdown";
import FormModal from "../../shared/FormModal";
import { editPanelBomItems, getProducts } from "@/services/api";
import { useModal } from "@/contexts/modal";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { useManufacturers } from "@/contexts/manufacturers";

const EditItemModal = ({ itemDetails, sectionName, onSuccessfullSubmit }) => {
  const { closeModal } = useModal();
  const { manufacturers } = useManufacturers();
  const [productList, setProductList] = useState([]);
  const [editData, setEditData] = useState({});
  const [item, setItem] = useState({
    item: "",
    item_name: "",
    product_code: "",
    make: "",
    make_name: "",
    quantity: "",
    unit: "",
    remarks: "",
  });

  useEffect(() => {
    if (itemDetails != null) {
      setItem(itemDetails);
      fetchProductHandler({ make: itemDetails?.make });
    }
  }, [itemDetails]);

  const fetchProductHandler = async (filteredObj = {}) => {
    await requestHandler(
      async () => await getProducts(filteredObj),
      null,
      (data) => {
        setProductList(data.data.output);
      },
      toast.error
    );
  };

  const valueHandler = (e) => {
    setItem((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setEditData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async () => {
    if (Object.keys(editData).length > 0) {
      const keysToCheck = {
        make: "Make",
        item: "Item",
        quantity: "Quantity",
      };

      const validationResult = checkSpecificKeys(item, keysToCheck);
      if (validationResult.isValid === false) {
        toast.error(validationResult.message);
        return;
      }

      await requestHandler(
        async () => await editPanelBomItems(item.id, editData),
        null,
        (data) => {
          toast.success("Item Saved Successfully...");
          closeModal("edit-panel-item");
          onSuccessfullSubmit();
        },
        toast.error
      );
    } else {
      closeModal("edit-panel-item");
    }
  };

  return (
    <FormModal
      id={"edit-panel-item"}
      onSubmit={onSubmit}
      ctaText={"Save"}
      heading={
        <>
          Edit Item For <span className="font-extrabold">{sectionName}</span>
        </>
      }
      className={"overflow-visible"}
    >
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-5">
        <SelectForObjects
          margin={"0px"}
          height={"36px"}
          setselected={(value) => {
            const selected = manufacturers.find((m) => m.name === value);
            setItem((prev) => ({
              ...prev,
              make: selected?.id,
              make_name: selected?.name,
              item: "",
              unit: "",
            }));
            setEditData((prev) => ({
              ...prev,
              make: selected?.id,
              item: "",
              unit: "",
            }));
            fetchProductHandler({ manufacturer: selected?.id });
          }}
          selected={item.make_name}
          options={manufacturers}
          optionID="id"
          optionName={"name"}
          placeholder="Select Make"
          dropdownLabel={"Select Make"}
        />
        <SelectForObjects
          margin={"0px"}
          height={"36px"}
          setselected={(value) => {
            const selected = productList.find(
              (product) => product.product_code === value
            );
            setItem((prev) => ({
              ...prev,
              item: selected?.id,
              unit: selected?.inventory?.unit,
              item_name: selected?.name,
              product_code: selected?.product_code,
            }));
            setEditData((prev) => ({
              ...prev,
              item: selected?.id,
              unit: selected?.inventory?.unit,
            }));
          }}
          selected={
            productList?.find((product) => product.id === item.item)
              ?.product_code
          }
          options={productList}
          optionName={"product_code"}
          placeholder="Select Item"
          dropdownLabel={"Select Item"}
        />
        <div className={`relative flex flex-col gap-2.5 w-full justify-center`}>
          <label
            className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
            htmlFor={"Unit of Measurement"}
          >
            Unit of Measurement
          </label>
          <span className="text-sm">{item.unit ?? item.inventory.unit}</span>
        </div>

        <Input
          type="number"
          onChange={valueHandler}
          value={item.quantity.quantity}
          name={"quantity"}
          label={"Select Quantity (Value)"}
        />
        <Input
          type="textarea"
          onChange={valueHandler}
          value={item.remarks}
          name={"remarks"}
          label={"Remark"}
          outerClass="col-span-2"
        />
      </div>
    </FormModal>
  );
};

export default EditItemModal;
