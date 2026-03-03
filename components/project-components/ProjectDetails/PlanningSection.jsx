import React, { useState } from "react";
import Button from "../../shared/Button";
import { useModal } from "@/contexts/modal";
import { FaPen } from "react-icons/fa";
import { LuX, LuCheck } from "react-icons/lu";
import ProjectItemTable from "../ProjectItemTable";
import { useManufacturers } from "@/contexts/manufacturers";
import {
  savePlanningSectionBomDetails,
  getUnitPriceAvg,
  getItemPoList,
} from "@/services/api";
import { useProject } from "@/contexts/project";
import { toast } from "sonner";
import { requestHandler } from "@/services/ApiHandler";
import { addCommasToNumber } from "@/utils/numberHandler";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import dynamic from "next/dynamic";

const ItemPoList = dynamic(
  () => import("@/components/modals/ProjectDetails/PlanningItemPoList")
);

const PlanningSection = ({ section, selectedCatagory }) => {
  const { openModal, closeModal } = useModal();
  const [bomItems, setBomItems] = useState(section?.bom_items);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedRows, setEditedRows] = useState([]);
  const [displayAvgPrice, setDisplayAvgPrice] = useState(false);
  const [poItemList, setPoItemList] = useState([]);
  const { manufacturers } = useManufacturers();

  const { projectDetails, getProjectDetailsHandler } = useProject();

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility").accessibility[0].projects ??
    {};

  const tableHeader = [
    { name: "Item Code", width: "10rem", key: "product_code" },
    { name: "Item", width: "15rem", key: "item_name" },
    { name: "Make", width: "12rem", key: "make_name" },
    { name: "Quantity", width: "6rem", key: "quantity_new" },
    // Conditionally add the "Avg Price" column
    ...(displayAvgPrice
      ? [
          {
            name: "PO Count",
            key: "item_count",
            displayType: "price",
            width: "7rem",
          },
          {
            name: "Avg. Unit Price",
            key: "average_unit_price",
            type: "po_avg_unit_price",
            width: "9rem",
            onClick: (row) => {
              fetchItemPoList(row.item);
            },
          },
        ]
      : []),
    {
      name: "BBU Unit Price(₹)",
      width: "10rem",
      key: "bbu_unit_price",
      type: "number",
      displayType: "price",
    },
    {
      name: "Per Watt",
      width: "7rem",
      key: "bbu_per_watt",
    },
    {
      name: "Total BBU Amount(₹)",
      width: "12rem",
      key: "bbu_total_price",
      displayType: "price",
    },
    {
      name: "Estimated Time of Dispatch at site",
      width: "12rem",
      key: "etd",
      type: "date",
    },
  ];

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

    let total = 0;
    bomItems.map((item) => {
      total =
        total +
        Number(item.bbu_unit_price || 0) * Number(item.quantity.quantity || 0);
      productList.push({
        bom_item_id: item.id,
        bbu_unit_price: item.bbu_unit_price,
        etd: item.etd,
        bbu_total_price:
          Number(item.bbu_unit_price || 0) *
          Number(item.quantity.quantity || 0),
      });
    });
    formDetails = {
      bom_section: section.id,
      bom_section_budget: total,
      product_list: productList,
    };
    await savePlanningSectionBomDetails(formDetails);

    setIsEditMode(false);
    getProjectDetailsHandler();
  };

  const fetchItemPoList = async (itemId) => {
    await requestHandler(
      async () => await getItemPoList({ item_id: itemId }),
      null,
      (res) => {
        setPoItemList(res.data.output);
        openModal("show-planning-item-po-list");
      },
      toast.error
    );
  };

  const fetchAvgUnitPrice = async (sectionId) => {
    const selectedSection = projectDetails?.bom_heads[selectedCatagory].filter(
      (section) => section.id == sectionId
    )[0];
    const itemList = selectedSection.bom_items.map((item) => item.item);

    await requestHandler(
      async () => await getUnitPriceAvg(itemList),
      null,
      (res) => {
        const unitPriceList = res.data;
        const newBomList = [...bomItems];
        newBomList.map((item) => {
          const index = unitPriceList.findIndex(
            (unitItem) => unitItem.item_id == item.item
          );
          if (index != -1) {
            item.item_count = unitPriceList[index].item_count;
            item.average_unit_price = unitPriceList[index].average_unit_price;
            item.is_bbu_avg_unit_price =
              item.bbu_unit_price == null ? true : false;
            item.bbu_unit_price =
              item.bbu_unit_price == null
                ? unitPriceList[index].average_unit_price
                : item.bbu_unit_price;
          }
        });
        setIsEditMode(true);
        setBomItems([...newBomList]);
        setDisplayAvgPrice(true);
      },
      toast.error
    );
  };

  const handleCancelEdit = () => {
    const newBomList = [...bomItems];
    newBomList.map((item) => {
      item.bbu_unit_price = item.is_bbu_avg_unit_price
        ? null
        : item.bbu_unit_price;
    });
    setIsEditMode(false);
    setBomItems(newBomList);
  };

  return (
    <div className="flex flex-col gap-2.5" key={section.id}>
      <div className="flex justify-between items-center mt-2">
        <p className="text-zinc-800 text-base font-bold tracking-tight">
          {section.name} (BBU Amount: ₹{addCommasToNumber(totalBbuAmount)}; Per
          Watt: ₹{addCommasToNumber(perWatt)})
        </p>
        <div className="flex items-center gap-2">
          {/* For Edit Items,Cancel and Save button-
          1.In case of Planning, admin can edit any category.
          2.In case of Engineering, same rules applies as for Add Item button. 
          3.Edit Item button is not visible after planning is approved
          */}
          {accessibilityInfo?.planning_tab.edit_view &&
            projectDetails?.planning_section_approval !== "Approved" &&
            section.bom_items.length > 0 && (
              <>
                {isEditMode ? (
                  <>
                    <Button
                      onClick={handleCancelEdit}
                      variant={"inverted"}
                      customText={"#F47920"}
                      className="border-1 h-[29px] hover:bg-slate-100  bg-white px-2  "
                    >
                      <LuX size={15} />
                      Cancel Edit
                    </Button>
                    <Button
                      onClick={saveBomDetails}
                      variant={"inverted"}
                      customText={"#F47920"}
                      className="border-1 h-[29px] bg-white text-green-500 px-2 hover:bg-green-50 "
                    >
                      <LuCheck size={15} />
                      Save
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => fetchAvgUnitPrice(section.id)}
                    variant={"inverted"}
                    customText={"#F47920"}
                    className="bg-orange-400/10 text-orange-500 px-2 hover:bg-orange-600/10 "
                  >
                    <FaPen />
                    Edit Items
                  </Button>
                )}
              </>
            )}
        </div>
      </div>
      {/* For Engineering tab - table is only editable for Electrical, Mechanical and Installation sections */}
      {/* For Engineering tab - Only Electrical and Mechanical leads can edit details in Electrical and Mechanical table respectively */}
      {/* For Planning tab - Only project manager can add/edit details */}
      <div className="overflow-x-scroll">
        <ProjectItemTable
          isEditMode={isEditMode}
          valueHandler={valueHandler}
          rows={bomItems}
          columns={tableHeader}
          onRowClick={() => {}}
          highlightContigencyRows={true}
          projectCapacity={projectDetails.project_capacity || 1}
        />
      </div>
      <ItemPoList poList={poItemList} />
    </div>
  );
};

export default PlanningSection;
