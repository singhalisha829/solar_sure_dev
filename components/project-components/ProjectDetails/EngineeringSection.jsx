import React, { useState } from "react";
import Button from "../../shared/Button";
import { useModal } from "@/contexts/modal";
import { FaPlusCircle } from "react-icons/fa";
import ProjectItemTable from "../ProjectItemTable";
import { useManufacturers } from "@/contexts/manufacturers";
import {
  saveEngineeringSectionBomDetails,
  createBomItems,
  deleteSections,
  editBomItem,
  createPanelBomItems,
  deletePanelBomItems,
} from "@/services/api";
import { useProject } from "@/contexts/project";
import { toast } from "sonner";
import { requestHandler } from "@/services/ApiHandler";
import dynamic from "next/dynamic";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import EngineeringPanelTabel from "./EngineeringPanelTable";

const AddItemModal = dynamic(() => import("../../modals/AddItemModal"));
const AddPanelInverterItemModal = dynamic(
  () => import("../../modals/ProjectDetails/AddPanelInverterItem")
);
const EditItemModal = dynamic(
  () => import("../../modals/ProjectDetails/EditItemModal")
);
const WarningModal = dynamic(() => import("../../modals/WarningModal"));
const SPModal = dynamic(() => import("../../modals/ProjectDetails/SPModal"));
const AddEngineeringItemQuantity = dynamic(
  () => import("../../modals/ProjectDetails/EditEngineeringItemQuantity")
);

const Section = ({
  section,
  tableHeader,
  tab,
  selectedCatagory,
  products,
  userInfo,
}) => {
  const { openModal, closeModal } = useModal();
  const [bomItems, setBomItems] = useState(section?.bom_items);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errorRows, setErrorRows] = useState([]);
  const [editedRows, setEditedRows] = useState([]);
  const { manufacturers } = useManufacturers();
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [selectedEngineeringItem, setSelectedEngineeringItem] = useState(null);

  const { projectDetails, getProjectDetailsHandler } = useProject();

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility").accessibility[0].projects ??
    {};

  let totalBbuAmount = 0;
  section.bom_items.map(
    (item) => (totalBbuAmount += Number(item.bbu_total_price || 0))
  );
  const perWatt =
    totalBbuAmount / ((projectDetails.project_capacity || 1) * 1000);

  const valueHandler = (key, value, index) => {
    let bomItemList = [...bomItems];
    if (key === "make") {
      const selected = manufacturers?.find((option) => option.name === value);
      bomItemList[index] = { ...bomItemList[index], make: selected?.id };
    } else if (key === "quantity") {
      let quantity = `${value} ${bomItemList[index].quantity_new.split(" ")[1]}`;
      bomItemList[index] = { ...bomItemList[index], quantity_new: quantity };
    } else {
      bomItemList[index][key] = value;
    }
    setBomItems([...bomItemList]);
    setEditedRows([...editedRows, bomItemList[index]]);
  };

  const saveBomDetails = async () => {
    let formDetails = {},
      productList = [];
    if (tab === "Engineering") {
      const itemsWithZeroQuantity = bomItems.filter((product) => {
        if (product.quantity_new.split(" ")[0] === "") {
          return true;
        }
        return false;
      });
      if (itemsWithZeroQuantity.length > 0) {
        setErrorRows(itemsWithZeroQuantity);
        toast.error(
          `Quantity can't be zero for an Item! Please either add quantity or remove the Item from list.`
        );
        return;
      }

      let total = 0;
      bomItems.map((item) => {
        total =
          total +
          Number(item.bbu_unit_price || 0) *
          Number(item.quantity_new.split(" ")[0] || 0);
        productList.push({
          item: item.item,
          make: item.make,
          quantity: item.quantity_new.split(" ")[0],
          unit: item.quantity_new.split(" ")[1],
          remarks: item.remarks,
          bom_item_id: item.id,
          bbu_unit_price: item.bbu_unit_price,
          bbu_total_price:
            Number(item.bbu_unit_price || 0) *
            Number(item.quantity_new.split(" ")[0] || 0),
        });
      });

      formDetails = {
        bom_section: section.id,
        product_list: productList,
        bom_section_budget: total,
      };
      await saveEngineeringSectionBomDetails(formDetails);
    }

    setIsEditMode(false);
    getProjectDetailsHandler();
  };

  const addItemHandler = async (item) => {
    if (selectedCatagory === "Panel") {
      const apiData = {
        bom_section: item.bom_section,
        item: item.item,
        make: item.make,
        quantity: item.quantity,
        unit: item.unit,
        remarks: item.remarks,
      };
      await requestHandler(
        async () => await createPanelBomItems(apiData),
        null,
        (data) => {
          toast.success("Item Created Successfully...");
          closeModal("panel-inverter-item" + section.id);
          getProjectDetailsHandler();
        },
        toast.error
      );
    } else {
      await requestHandler(
        async () => await createBomItems(item),
        null,
        (data) => {
          toast.success("Item Created Successfully...");
          if (selectedCatagory === "Inverter") {
            closeModal("panel-inverter-item" + section.id);
          } else {
            closeModal("item" + section.id);
          }
          getProjectDetailsHandler();
        },
        toast.error
      );
    }
  };

  const handleDropSection = (index) => {
    if (index == 0) {
      if (bomItems.length == 0) {
        deleteBomSections();
      } else {
        openModal("drop-section-warning");
      }
    }
  };

  const deleteBomSections = async () => {
    await requestHandler(
      async () => await deleteSections(section.id),
      null,
      (data) => {
        toast.success("Section Deleted Successfully...");
        getProjectDetailsHandler();
      },
      toast.error
    );
  };

  const handleEngineeringItemDelete = async () => {
    if (selectedEngineeringItem.isPanel) {
      await requestHandler(
        async () => await deletePanelBomItems(selectedEngineeringItem.id),
        null,
        (data) => {
          toast.success("Item Deleted Successfully...");
          closeModal("delete-engineering-item-warning");
          getProjectDetailsHandler();
        },
        toast.error
      );
    } else {
      const apiData = {
        transtion_type: "delete",
      };

      await requestHandler(
        async () => await editBomItem(selectedEngineeringItem.id, apiData),
        null,
        (data) => {
          toast.success("BOM Item Deleted Successfully...");
          closeModal("delete-engineering-item-warning");
          getProjectDetailsHandler();
        },
        toast.error
      );
    }
  };

  return (
    <div className="flex flex-col gap-2.5" key={section.id}>
      <div className="flex justify-between items-center mt-2">
        <p className="text-zinc-800 text-base font-bold tracking-tight">
          {section.name}{" "}
        </p>
        <div className="flex items-center gap-2">
          {/* For Add Item button - 
          1.Add Item button is not displayed for Panel and Inverter sections
          2.Add Item button is not visible after planning is approved
           */}
          {tab === "Engineering" &&
            projectDetails?.planning_section_approval !== "Approved" &&
            [
              "Electrical",
              "Mechanical",
              "Inroof",
              "Other Structure",
              "Inverter",
            ].includes(selectedCatagory) &&
            accessibilityInfo?.engineering_tab.add_view && (
              <Button
                onClick={() => {
                  if (selectedCatagory === "Inverter") {
                    openModal("panel-inverter-item" + section.id);
                  } else {
                    openModal("item" + section.id);
                  }
                }}
                variant={"inverted"}
                customText={"#F47920"}
                className="bg-orange-400/10 text-primary px-2 hover:bg-orange-600/10 "
              >
                <FaPlusCircle />
                Add Item
              </Button>
            )}

          {selectedCatagory === "Panel" && !projectDetails?.is_bbu_approved && (
            <Button
              onClick={() => openModal("panel-inverter-item" + section.id)}
              variant={"inverted"}
              customText={"#F47920"}
              className="bg-orange-400/10 text-primary px-2 hover:bg-orange-600/10 "
            >
              Add Items
            </Button>
          )}
        </div>
        <SPModal id={"set-sp" + section.id} items={bomItems} />
        <AddItemModal
          id={section.id}
          onSubmit={addItemHandler}
          sectionName={section.name}
          products={products}
        />
        <AddPanelInverterItemModal
          id={section.id}
          onSubmit={addItemHandler}
          sectionName={section.name}
          products={products}
        />
      </div>
      {/* For Engineering tab - table is only editable for Electrical, Mechanical and Installation sections */}
      {/* For Engineering tab - Only Electrical and Mechanical leads can edit details in Electrical and Mechanical table respectively */}
      {/* For Planning tab - Only project manager can add/edit details */}
      <div className="overflow-x-scroll">
        {tab === "Engineering" && selectedCatagory === "Panel" ? (
          <EngineeringPanelTabel
            isEditMode={
              accessibilityInfo?.planning_tab.edit_view &&
              !projectDetails?.is_bbu_approved
            }
            valueHandler={valueHandler}
            rows={bomItems}
            columns={tableHeader}
            onRowClick={() => { }}
            errorRows={errorRows}
            highlightContigencyRows={true}
            handleOpenModal={(row) => {
              setSelectedPanel(row);
              openModal("edit-panel-item");
            }}
            onDeleteRow={(row) => {
              setSelectedEngineeringItem({ isPanel: true, ...row });
              openModal("delete-engineering-item-warning");
            }}
            projectCapacity={projectDetails.project_capacity || 1}
          // showContigencyBubble={true}
          />
        ) : (
          <ProjectItemTable
            isEditMode={isEditMode}
            valueHandler={valueHandler}
            rows={bomItems}
            columns={tableHeader}
            onRowClick={() => { }}
            errorRows={errorRows}
            showMenu={tab === "Engineering"}
            onMenuOptionClicked={handleDropSection}
            highlightContigencyRows={true}
            projectCapacity={projectDetails.project_capacity || 1}
            // Engineering tab items are editable as long as planning section is not approved.Once approved, only admin can edit it.
            addEngineeringQuanitity={
              tab === "Engineering" &&
              (projectDetails.planning_section_approval !== "Approved" ||
                (projectDetails.planning_section_approval === "Approved" &&
                  userInfo?.role === "admin"))
            }
            onClickEdit={(row) => {
              setSelectedEngineeringItem(row);
              openModal("add-engineering-item-quantity");
            }}
            onDeleteRow={(row) => {
              setSelectedEngineeringItem(row);
              openModal("delete-engineering-item-warning");
            }}
            // Engineering tab items can be deleted only uptil planning section is not approved
            canDelete={projectDetails.planning_section_approval !== "Approved"}
          // showContigencyBubble={true}
          />
        )}
      </div>
      <EditItemModal
        id={section.id}
        sectionName={section.name}
        products={products}
        itemDetails={selectedPanel}
        onSuccessfullSubmit={getProjectDetailsHandler}
      />
      <WarningModal
        modalId={"drop-section-warning"}
        modalContent={
          <>
            Please delete all the items in the section -{" "}
            <strong>{section?.name}</strong> before dropping the section.
          </>
        }
        hideCtaButton={true}
      />
      <AddEngineeringItemQuantity
        itemDetails={selectedEngineeringItem}
        onSuccessfullSubmit={getProjectDetailsHandler}
      />
      <WarningModal
        modalId={"delete-engineering-item-warning"}
        modalContent={
          <>
            Are you sure that you want to delete{" "}
            <strong>
              {selectedEngineeringItem?.product_code} (
              {selectedEngineeringItem?.item_name})
            </strong>
            ?
          </>
        }
        onSubmit={handleEngineeringItemDelete}
      />
    </div>
  );
};

export default Section;
