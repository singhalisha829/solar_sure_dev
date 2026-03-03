import { useEffect, useState } from "react";
import Button from "../shared/Button";
import { useManufacturers } from "@/contexts/manufacturers";
import EditableTable from "./EditableTable";
import { useModal } from "@/contexts/modal";
import { editRegisteredProject } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { FiPlusCircle } from "react-icons/fi";
import { useProduct } from "@/contexts/product";
import ButtonLoading from "../shared/ButtonLoader";
import dynamic from "next/dynamic";

const AddItemModal = dynamic(() => import("../modals/AddProjectHeadItemModal"));
const SectionModal = dynamic(() => import("../modals/SectionModal"));

const ProjectHeads = ({
  sectionDetails,
  onNextClick,
  onBackClick,
  projectId,
  sectionNameList,
  onTotalProjectCapacityChange,
  enteredProjectCapacity,
  enteredProjectArea,
  charges,
  status,
}) => {
  const { openModal, closeModal } = useModal();
  const [sectionList, setSectionList] = useState(sectionDetails);
  const { manufacturers } = useManufacturers();
  const { units } = useProduct();
  const [totalProjectCapacity, setTotalProjectCapacity] = useState(0);
  const [calculatedProjectCapacity, setCalculatedProjectCapacity] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let are_solar_panels_added = false;
    sectionList.map((section) => {
      if (section.section === "Solar Panels") {
        let total = 0;
        are_solar_panels_added = true;

        // if solar panel section exits and 1 or more items are added, then considered the total project capacity of each item in this section for calculation
        if (section.product_details.length > 0) {
          section.product_details.map(
            (product) => (total += Number(product.project_capacity) || 0)
          );
          setTotalProjectCapacity(total);
          setCalculatedProjectCapacity(total);
          onTotalProjectCapacityChange(total);
        }
        // if solar panel section exits and no items are added, then considered project capacity entered by user for calculation
        else {
          setTotalProjectCapacity(enteredProjectCapacity);
          onTotalProjectCapacityChange(enteredProjectCapacity);
        }
      }
    });

    // if solar panel section doesnt exists, then considered project capacity entered by user for calculation
    if (!are_solar_panels_added) {
      setTotalProjectCapacity(enteredProjectCapacity);
      onTotalProjectCapacityChange(enteredProjectCapacity);
    }
  }, []);
  const addNewSection = (sectionName) => {
    setSectionList([
      {
        section: sectionName,
        isEdit: true,
        product_details: [],
      },
      ...sectionList,
    ]);

    closeModal("add-section");
  };

  const tableHeaderList = (sectionName) => {
    if (["Solar Inverter", "Solar Panels"].includes(sectionName)) {
      return [
        {
          name: "MANUFACTURER",
          key: "Product_name",
          keyValue: "Product",
          type: "dropdown",
          minWidth: "160px",
          options: [...manufacturers, { name: "Others", id: "Others" }],
          optionId: "id",
          optionName: "name",
        },
        {
          name: "MODEL",
          key: "model_name",
          keyValue: "model",
          type: "dropdown",
          minWidth: "100px",
          options: [...manufacturers, { name: "Others", id: "Others" }],
          optionId: "id",
          optionName: "name",
        },
        {
          name: (
            <span>
              UPLOAD
              <br /> DATASHEET
            </span>
          ),
          type: "file",
          key: "upload_datasheet",
          minWidth: "80px",
        },
        {
          name: "WATTAGE (WP)",
          displayType: "amount",
          key: "wattage",
          minWidth: "120px",
        },
        {
          name: "QUANTITY",
          displayType: "amount",
          type: "custom-view",
          key: "quantity",
          minWidth: "80px",
          showTotalAmount: true,
        },
        {
          name: (
            <span>
              PROJECT
              <br /> CAPACITY (WP)
            </span>
          ),
          key: "project_capacity",
          minWidth: "120px",
          displayType: "amount",
          showTotalAmount: true,
        },
        {
          name: (
            <span>
              CONSIDERED
              <br /> PRICE
            </span>
          ),
          type: "custom-view",
          key: "considered_price",
          displayType: "price",
          key2: "considered_price_unit",
          minWidth: "100px",
        },
        {
          name: "AMOUNT (₹)",
          key: "amount",
          minWidth: "100px",
          displayType: "price",
          showTotalAmount: true,
        },
        {
          name: "TRANSPORTATION (₹)",
          type: "custom-view",
          key: "transportation",
          minWidth: "150px",
          displayType: "price",
          showTotalAmount: true,
        },
        {
          name: (
            <span>
              TOTAL
              <br /> AMOUNT (₹)
            </span>
          ),
          key: "total_amount",
          minWidth: "100px",
          displayType: "price",
          showTotalAmount: true,
        },
        { name: "REMARKS", key: "remark", minWidth: "200px", type: "textarea" },
      ];
    } else if (["BOS-Structure", "BOS-Electrical"].includes(sectionName)) {
      return [
        { name: "PRODUCT", key: "Product", type: "text", minWidth: "160px" },
        {
          name: (
            <span>
              PRODUCT
              <br /> SPECIFICATION
            </span>
          ),
          type: "text",
          key: "product_specification",
          minWidth: "100px",
        },
        {
          name: (
            <span>
              UPLOAD
              <br /> DATASHEET
            </span>
          ),
          type: "file",
          key: "upload_datasheet",
          minWidth: "80px",
        },
        {
          name: (
            <span>
              UNIT OF
              <br /> MEASUREMENT
            </span>
          ),
          key: "unit_name",
          keyValue: "unit",
          type: "dropdown",
          minWidth: "100px",
          options: units,
          optionId: "id",
          optionName: "name",
        },
        {
          name: "QUANTITY",
          type: "custom-view",
          key: "quantity",
          displayType: "amount",
          minWidth: "80px",
        },
        {
          name: (
            <span>
              PROJECT
              <br /> CAPACITY (WP)
            </span>
          ),
          type: "fixed-value",
          displayType: "amount",
          displayValue: totalProjectCapacity,
          minWidth: "120px",
        },
        {
          name: (
            <span>
              CONSIDERED
              <br /> PRICE
            </span>
          ),
          type: "custom-view",
          key: "considered_price",
          displayType: "price",
          key2: "considered_price_unit",
          minWidth: "100px",
        },
        {
          name: "AMOUNT (₹)",
          key: "amount",
          displayType: "price",
          minWidth: "100px",
        },
        {
          name: "TRANSPORTATION (₹)",
          type: "custom-view",
          displayType: "price",
          key: "transportation",
          minWidth: "150px",
        },
        {
          name: (
            <span>
              TOTAL
              <br /> AMOUNT (₹)
            </span>
          ),
          displayType: "price",
          key: "total_amount",
          minWidth: "100px",
        },
        { name: "REMARKS", key: "remark", minWidth: "200px", type: "textarea" },
      ];
    } else {
      return [
        {
          name: "WORK DESCRIPTION",
          key: "Product_name",
          keyValue: "Product",
          type: "text",
          minWidth: "160px",
          options: [...manufacturers, { name: "Others", id: "Others" }],
          optionId: "id",
          optionName: "name",
        },
        {
          name: "SCOPE OF WORK",
          type: "text",
          key: "scope_of_work",
          minWidth: "100px",
        },
        {
          name: (
            <span>
              UPLOAD
              <br /> DATASHEET
            </span>
          ),
          type: "file",
          key: "upload_datasheet",
          minWidth: "80px",
        },
        {
          name: (
            <span>
              PROJECT
              <br /> DAYS
            </span>
          ),
          type: "number",
          displayType: "amount",
          key: "project_days",
          minWidth: "80px",
        },
        {
          name: (
            <span>
              MANPOWER
              <br /> EXPECTED
            </span>
          ),
          type: "number",
          displayType: "amount",
          key: "manpower_expected",
          minWidth: "80px",
        },
        {
          name: (
            <span>
              PROJECT
              <br /> CAPACITY (WP)
            </span>
          ),
          type: "fixed-value",
          displayType: "amount",
          displayValue: totalProjectCapacity,
          minWidth: "120px",
        },
        {
          name: (
            <span>
              CONSIDERED
              <br /> PRICE
            </span>
          ),
          type: "custom-view",
          key: "considered_price",
          key2: "considered_price_unit",
          displayType: "price",
          minWidth: "100px",
        },
        {
          name: "AMOUNT (₹)",
          key: "amount",
          displayType: "price",
          minWidth: "100px",
        },
        {
          name: "TRANSPORTATION (₹)",
          type: "custom-view",
          displayType: "price",
          key: "transportation",
          minWidth: "150px",
        },
        {
          name: (
            <span>
              TOTAL
              <br /> AMOUNT (₹)
            </span>
          ),
          key: "total_amount",
          displayType: "price",
          minWidth: "100px",
        },
        { name: "REMARKS", key: "remark", minWidth: "200px", type: "textarea" },
      ];
    }
  };

  const addSectionChildren = (data, sectionIndex) => {
    let list = sectionList;
    list[sectionIndex].product_details.push(data);
    setSectionList([...list]);

    //calculate total project capacity of solar panels
    if (list[sectionIndex].section === "Solar Panels") {
      let total = 0;
      list[sectionIndex].product_details.map(
        (product) => (total += Number(product.project_capacity) || 0)
      );
      setTotalProjectCapacity(total);
      setCalculatedProjectCapacity(total);
      onTotalProjectCapacityChange(total);
    }
    closeModal("add-project-head-item" + sectionIndex);
  };

  const handleSectionChildrenDetails = (data, childIndex, sectionIndex) => {
    // Create a new copy of the state array
    let newList = [...sectionList];

    // Create a new copy of the section and child objects
    newList[sectionIndex] = {
      ...newList[sectionIndex],
      product_details: [...newList[sectionIndex].product_details],
    };

    // Update the name property
    newList[sectionIndex].product_details[childIndex] = data;

    // Update the state with the new copy
    setSectionList(newList);

    //calculate total project capacity of solar panels
    if (newList[sectionIndex].section === "Solar Panels") {
      let total = 0;
      newList[sectionIndex].product_details.map(
        (product) => (total += Number(product.project_capacity) || 0)
      );
      setTotalProjectCapacity(total);
      onTotalProjectCapacityChange(total);
    }
  };

  const removeSectionChildren = (sectionIndex, childIndex) => {
    let newList = [...sectionList];

    newList[sectionIndex] = {
      ...newList[sectionIndex],
      product_details: [...newList[sectionIndex].product_details],
    };
    newList[sectionIndex].product_details.splice(childIndex, 1);
    setSectionList([...newList]);
  };

  const addAllProductCost = (list) => {
    let sectionSum = 0;
    //calculate total cost sum of all products in a single section
    list.map(
      (element) =>
        (sectionSum += element.total_amount ? Number(element.total_amount) : 0)
    );
    return sectionSum;
  };

  const onSubmit = async () => {
    setIsLoading(true);
    let section_list = [];

    sectionList.map((section) => {
      let section_details = {};
      if (section.product_details.length !== 0) {
        section_details.section = section.section;
        section_details.manufacturer_dropdown = section.manufacturer_dropdown;
        section_details.cost = addAllProductCost(section.product_details);
        section_details.product_details = section.product_details;

        if (section_details.product_details.length > 0) {
          section_list.push(section_details);
        }
      }
    });
    const formData = new FormData();

    formData.append("product_section", JSON.stringify(section_list));
    formData.append("calculated_project_capacity_in_wp", totalProjectCapacity);
    // formData.append("status", "Incomplete");

    if (status === "Completed") {
      let sum = 0;
      section_list.map((element) => (sum += Number(element.cost)));
      const netAmount =
        sum +
        Number(charges.total_freight_charges || 0) +
        Number(charges.other_charges || 0);

      formData.append(
        "total_amount",
        netAmount + Number(charges.total_profit_margin || 0)
      );
      formData.append("net_amount", netAmount);
    }
    await requestHandler(
      async () => await editRegisteredProject(formData, projectId),
      null,
      async (data) => {
        toast.success("Project Details Saved Successfully...");
        onNextClick(section_list);
        setIsLoading(false);
      },
      toast.error
    );
    setIsLoading(false);
  };

  //   console.log("val",sectionDetails,sectionList)

  return (
    <>
      <span className="w-full flex justify-between">
        <h4 className="text-zinc-800 text-xl font-bold tracking-tight">
          Project Heads
        </h4>

        {sectionNameList.filter(
          (item1) => !sectionList.some((item2) => item1.name == item2.section)
        ).length > 0 && (
            <Button className={"px-2"} onClick={() => openModal("add-section")}>
              <FiPlusCircle />
              Add Project Head
            </Button>
          )}

        <SectionModal
          dropdownList={sectionNameList.filter(
            (item1) => !sectionList.some((item2) => item1.name == item2.section)
          )}
          heading="Add Project Head"
          ctaText="Create Project Head"
          onSubmit={addNewSection}
        />
      </span>

      {sectionList.length > 0 &&
        sectionList.map((section, sectionIndex) => {
          return (
            <div className="flex flex-col gap-2.5" key={sectionIndex}>
              <div className="flex justify-between items-center">
                <p className="text-dark-bluish-green text-base font-bold tracking-tight">
                  {section.section}
                </p>

                <Button
                  onClick={() =>
                    openModal("add-project-head-item" + sectionIndex)
                  }
                  variant={"inverted"}
                  customText={"#F47920"}
                  className="border-1 border-dark-bluish-green text-dark-bluish-green px-2 bg-white hover:bg-slate-100 "
                >
                  <FiPlusCircle size={15} />
                  Add {section.section}
                </Button>
                <AddItemModal
                  projectHeadName={section.section}
                  modalId={"add-project-head-item" + sectionIndex}
                  totalProjectCapacity={totalProjectCapacity}
                  projectArea={enteredProjectArea}
                  enteredProjectCapacity={enteredProjectCapacity}
                  calculatedProjectCapacity={calculatedProjectCapacity}
                  onAddItem={(data) => addSectionChildren(data, sectionIndex)}
                  existingItemIds={section.product_details.map(
                    (product) => product?.model
                  )}
                  sectionItemList={
                    !["Solar Inverter", "Solar Panels"].includes(
                      section.section
                    )
                      ? section.product_details.map((product) =>
                        product.Product.toLowerCase()
                      )
                      : []
                  }
                />
              </div>
              <div className="overflow-x-auto">
                <EditableTable
                  onEditSuccess={(data, childIndex) =>
                    handleSectionChildrenDetails(data, childIndex, sectionIndex)
                  }
                  isEditMode={true}
                  isModalOpenOnEdit={
                    "edit-project-head-item-" + section.section
                  }
                  rows={section.product_details}
                  tableHeader={section.section}
                  columns={tableHeaderList(section.section)}
                  onDeleteRow={(childIndex) =>
                    removeSectionChildren(sectionIndex, childIndex)
                  }
                  projectRegistrationExistingItemIds={section.product_details.map(
                    (product) => product?.model
                  )}
                  totalProjectCapacity={totalProjectCapacity}
                  calculatedProjectCapacity={calculatedProjectCapacity}
                  enteredProjectCapacity={enteredProjectCapacity}
                  showFooterRow={["Solar Inverter", "Solar Panels"].includes(
                    section.section
                  )}
                />
              </div>
            </div>
          );
        })}

      <div className="h-[10%] w-full flex justify-end gap-4">
        <Button
          className=" h-[2rem] w-small"
          onClick={onBackClick}
          customText={"#9E9E9E"}
          variant={"gray"}
        >
          Back
        </Button>
        {isLoading ? (
          <Button
            variant="inverted"
            className="my-2 w-[5rem] mr-2 border  border-primary px-2 text-xs text-primary"
            customText={true}
          >
            <ButtonLoading />
          </Button>
        ) : (
          <Button className=" h-[2rem] w-small" onClick={onSubmit}>
            Save and Next
          </Button>
        )}
      </div>
    </>
  );
};

export default ProjectHeads;
