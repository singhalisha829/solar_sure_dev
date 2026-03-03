import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useModal } from "@/contexts/modal";
import { useProject } from "@/contexts/project";
import { requestHandler } from "@/services/ApiHandler";
import { createBomSection } from "@/services/api";
import { useManufacturers } from "@/contexts/manufacturers";
import { axiosInstance } from "@/services/ApiHandler";
import { FaPlusCircle } from "react-icons/fa";
import { LuX, LuCheck, LuDownload } from "react-icons/lu";

import { toast } from "sonner";
import Button from "../../shared/Button";
import Loading from "../../shared/Loading";
import Section from "./EngineeringSection";
import {
  getBOMTemplates,
  saveEngineeringSectionBomDetails,
  getProducts,
} from "@/services/api";
import { SelectForObjects } from "../../formPage/MultiSelectDropdown/MultiSelectDropdown";
import ProjectItemTable from "../ProjectItemTable";
import Table from "../../SortableTable";
import dynamic from "next/dynamic";
import { LocalStorageService } from "@/services/LocalStorageHandler";

const AddItemModal = dynamic(() => import("../../modals/AddItemModal"));

const ProjectInstallationFreight = dynamic(
  () =>
    import(
      "@/components/project-components/ProjectDetails/ProjectInstallationFreight"
    )
);
const ProjectContingency = dynamic(
  () =>
    import(
      "@/components/project-components/ProjectDetails/ProjectContingency/ProjectContingency"
    )
);
const ProjectMDL = dynamic(() => import("./ProjectMDL"));

const ProjectEngineering = ({
  selectedCatagory,
  userInfo,
  installationItems,
  onSuccessfullSubmit,
}) => {
  const router = useRouter();
  const { projectId, projectName } = router.query;
  const { manufacturers } = useManufacturers();
  const engineeringCategory =
    selectedCatagory === "Other Structure"
      ? "Other_structure"
      : selectedCatagory;

  const processedCategories = useRef(new Set());

  const {
    getProjectDetailsHandler,
    isLoading,
    projectDetails,
    contigencyBomList,
    fetchProjectContigency,
  } = useProject();
  const { openModal, closeModal } = useModal();
  const [projectHeadsId, setProjectHeadsId] = useState({});
  const [bomTemplateProductList, setBOMTemplateProductList] = useState([]);
  const [originalBomTemplateProductList, setOriginalBOMTemplateProductList] =
    useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showCreateBom, setShowCreateBom] = useState({
    Electrical: false,
    Mechanical: false,
  });
  const [selectedSection, setSelectedSection] = useState("");
  const [errorRows, setErrorRows] = useState([]);
  const [showItemDetails, setShowItemDetails] = useState({
    Electrical: false,
    Mechanical: false,
    Inroof: false,
    "Other Structure": false,
    Installation: false,
  });
  const [showSampleButton, setShowSampleButton] = useState({
    Electrical: true,
    Mechanical: true,
    Inroof: true,
    "Other Structure": true,
  });

  const [products, setProducts] = useState([]);

  const sections = projectDetails?.bom_heads;

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility").accessibility[0].projects
      .engineering_tab ?? {};

  const tableHeaderForSection = [
    { name: "Item Code", width: "10rem", key: "product_code" },
    { name: "Item", width: "12rem", key: "item_name" },
    { name: "Make", width: "12rem", key: "make_name" },
    { name: "Quantity", width: "5rem", key: "quantity_new" },
    {
      name: "Left Qty. After Packing List",
      width: "10rem",
      key: "bom_items_quantity_left_after_booking_new",
    },
    { name: "Remarks", width: "20rem", key: "remarks", type: "remarks" },
    { name: "Created By", width: "10rem", key: "created_by" },
  ];

  const tableHeaderForContingency = [
    { name: "Item Code", width: "8rem", key: "product_code" },
    { name: "Item", width: "12rem", key: "item_name" },
    { name: "Make", width: "12rem", key: "make_name" },
    { name: "Quantity", width: "5rem", key: "quantity", key2: "unit_name" },
    { name: "Remarks", key: "remarks", type: "remarks" },
  ];

  const tableHeaderForCreateBom = [
    { name: "Item Code", width: "w-[10%]", key: "product_code" },
    { name: "Item", width: "w-[10%]", key: "item_name" },
    {
      name: "Make",
      width: "w-[10%]",
      type: "create-bom-header",
      key: "make_name",
    },
    {
      name: "Quantity",
      width: "w-[10%]",
      type: "create-bom-header",
      key: "quantity",
      key2: "uom",
    },
    { name: "Remarks", width: "w-[10%]", key: "remarks", type: "text" },
  ];

  const tableHeaderForElectricalAndMechanical = [
    {
      name: "Product",
      key: "Product",
      width: "190px",
    },
    {
      name: "Unit of Measurement",
      key: "unit_name",
      width: "100px",
    },
    { name: "Quantity", key: "quantity", width: "100px" },
    {
      name: "Considered Price",
      key: "considered_price",
      key2: "considered_price_unit",
      width: "80px",
    },
    {
      name: "Amount (₹)",
      key: "amount",
      width: "100px",
    },
    { name: "Transportation (₹)", key: "transportation", width: "150px" },
    { name: "Total Amount (₹)", key: "total_amount", width: "100px" },
    { name: "Remark", key: "remark" },
  ];

  const tableHeaderForInstallation = [
    {
      name: "Work Description",
      key: "Product",
      width: "160px",
    },
    {
      name: "Scope Of Work",
      key: "scope_of_work",
      width: "100px",
    },
    {
      name: "Project Days",
      key: "project_days",
      width: "100px",
    },
    { name: "Manpower Expected", key: "manpower_expected", width: "100px" },
    {
      name: "Considered Price",
      key: "considered_price",
      key2: "considered_price_unit",
      width: "80px",
    },
    {
      name: "Amount (₹)",
      key: "amount",
      width: "100px",
    },
    { name: "Transportation (₹)", key: "transportation", width: "150px" },
    { name: "Total Amount (₹)", key: "total_amount", width: "100px" },
    { name: "Remark", key: "remark" },
  ];

  useEffect(() => {
    if (projectDetails) {
      setProjectHeadsId({
        Electrical: projectDetails.electrical_engineering_head,
        Mechanical: projectDetails.mechanical_engineering_head,
      });
      checkIfSampleExists("Electrical");
      checkIfSampleExists("Mechanical");

      if (Object.keys(projectDetails?.bom_heads).length > 0) {
        let bomHeads = projectDetails?.bom_heads;
        Object.keys(bomHeads).map((category) => {
          // If the category has no sections and hasn't been processed yet
          if (
            bomHeads[category].length === 0 &&
            category !== "Installation" &&
            !processedCategories.current.has(category)
          ) {
            addSectionHandler(category); // Call API to create section
            processedCategories.current.add(category); // Mark the category as processed
          }
        });
      }
    }
  }, [projectDetails]);

  useEffect(() => {
    fetchProductHandler();
  }, [engineeringCategory]);

  const fetchProductHandler = async () => {
    const productCategory =
      engineeringCategory === "Other_structure"
        ? "Other Structure"
        : engineeringCategory;
    await requestHandler(
      async () => await getProducts({ sections: [productCategory] }),
      null,
      (data) => setProducts(data.data.output),
      toast.error
    );
  };

  const addSectionHandler = async (category) => {
    const name = "Section-1";
    const sectionCategory =
      category == "Other_structure" ? "Other Structure" : category;
    await requestHandler(
      async () =>
        await createBomSection({
          bom_head: sectionCategory,
          project: projectId,
          name,
        }),
      null,
      async (res) => {
        await getProjectDetailsHandler();
      },
      toast.error // Display error alerts on request failure
    );
  };

  const checkIfSampleExists = async (category) => {
    const response = await axiosInstance.get(
      `/api/project/bom-items-templates/?project_type=${projectDetails?.project_type}&bom_head=${category}`
    );
    if (response.data?.message === "No Data Available") {
      setShowSampleButton({ ...showSampleButton, [category]: false });
    }
  };

  const handleDataForCreateBOM = async () => {
    await requestHandler(
      async () =>
        await getBOMTemplates({
          name: selectedCatagory,
          project_type: projectDetails?.project_type,
        }),
      null,
      (data) => {
        setBOMTemplateProductList(data.data.output[0].product_list);
        setOriginalBOMTemplateProductList(data.data.output[0].product_list);
      },
      toast.error
    );

    let section_list = [];
    sections[engineeringCategory].map((section) => {
      section_list.push({ name: section.name, id: section.id });
    });
    setSectionList([...section_list]);

    setShowCreateBom({ ...showCreateBom, [selectedCatagory]: true });
  };

  const valueHandler = (key, value, index) => {
    let bomItemList = bomTemplateProductList;
    if (key === "make") {
      const selected = manufacturers?.find((option) => option.name === value);
      bomItemList[index] = { ...bomItemList[index], make: selected?.id };
    } else if (key === "quantity") {
      bomItemList[index].quantity = value;
    } else {
      bomItemList[index][key] = value;
    }
    setBOMTemplateProductList([...bomItemList]);
  };

  const handleDeleteRow = (index) => {
    let bomItemList = bomTemplateProductList;
    bomItemList.splice(index, 1);
    setBOMTemplateProductList([...bomItemList]);
  };

  const saveBomDetails = async () => {
    let productList = [];
    const itemsWithZeroQuantity = bomTemplateProductList.filter((product) => {
      if (
        !product.quantity ||
        product.quantity === "" ||
        product.quantity == 0
      ) {
        return true;
      }
      return false;
    });
    if (!selectedSection || selectedSection === "") {
      toast.error(`Field Section is empty!`);
      return;
    }
    if (itemsWithZeroQuantity.length > 0) {
      setErrorRows(itemsWithZeroQuantity);
      toast.error(
        `Quantity can't be zero for an Item! Please either  add quantity or remove the Item from list.`
      );
      return;
    }
    bomTemplateProductList.map((item) => {
      productList.push({
        item: item.item,
        make: item.make,
        quantity: item.quantity,
        unit: item.uom,
        remarks: item.remarks,
      });
    });

    let existingSectionItems = sections[engineeringCategory].filter(
      (section) => section.id == selectedSection
    )[0]?.bom_items;

    let total = 0;
    if (existingSectionItems.length > 0) {
      existingSectionItems.map((item) => {
        total =
          total +
          Number(item.bbu_unit_price || 0) *
          Number(item.quantity_new.split(" ")[0] || 0);

        productList.push({
          item: item.item,
          make: item.make,
          quantity: item.quantity?.quantity,
          unit: item.quantity?.unit,
          remarks: item.remarks,
          bom_item_id: item.id,
          bbu_unit_price: item.bbu_unit_price,
          bbu_total_price:
            Number(item.bbu_unit_price || 0) *
            Number(item.quantity_new.split(" ")[0] || 0),
        });
      });
    }

    const formDetails = {
      bom_section: selectedSection,
      product_list: productList,
      bom_section_budget: total,
    };
    await saveEngineeringSectionBomDetails(formDetails);
    setIsEditMode(false);
    setSelectedSection("");
    setShowCreateBom({ ...showCreateBom, [selectedCatagory]: false });
    getProjectDetailsHandler();
  };

  const addItemHandler = (item) => {
    setBOMTemplateProductList([...bomTemplateProductList, item]);
    closeModal("item-bom" + selectedSection);
  };

  const onSelectSection = (value) => {
    const selected = sectionList.find((section) => section?.name === value);
    setSelectedSection(selected?.id);
    if (value !== "" && value != null) {
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
  };

  const handleContingencyExport = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/project/export-contingency-item/?project=${projectId}`,
        { responseType: "blob" }
      );

      if (response.status === 200) {
        // Create a Blob object from the response data
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // MIME type for Excel
        });

        // Create a URL for the Blob object
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element
        const link = document.createElement("a");
        link.href = url;
        link.download = `ContingencyItems.xlsx`; // Specify the Excel file name

        // Trigger the download by programmatically clicking the anchor element
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Release memory
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const onCancelCreateBom = () => {
    setBOMTemplateProductList([...originalBomTemplateProductList]);
    setIsEditMode(false);
    setShowCreateBom({
      ...showCreateBom,
      [selectedCatagory]: false,
    });
    setSelectedSection("");
    setErrorRows([]);
  };

  return (
    <div className="flex flex-col gap-5 grow overflow-scroll">
      <div className="flex justify-between items-center">
        <h4 className="text-zinc-800 flex gap-4 text-xl font-bold tracking-tight">
          {selectedCatagory}
          {["Electrical", "Mechanical", "Inroof", "Other Structure"].includes(
            selectedCatagory
          ) &&
            sections &&
            sections[engineeringCategory]?.length > 0 && (
              <span
                className="font-normal text-base underline underline-offset-4 cursor-pointer"
                onClick={() =>
                  setShowItemDetails({
                    ...showItemDetails,
                    [selectedCatagory]: !showItemDetails[selectedCatagory],
                  })
                }
              >
                {showItemDetails[selectedCatagory] ? "Hide" : "View"} Project
                Registration Item Details
              </span>
            )}
        </h4>
        {projectDetails?.planning_section_approval === "Approved" &&
          accessibilityInfo?.contingency_add_view &&
          !["Contingency", "MDL"].includes(selectedCatagory) && (
            <div className="flex gap-2 items-end">
              <Button
                className={"w-[13rem]"}
                onClick={() => {
                  router.push(
                    `/projects/projectContingency/${projectId}?projectName=${projectName}`
                  );
                }}
              >
                <FaPlusCircle />
                Add Contingency
              </Button>
            </div>
          )}

        {selectedCatagory === "Contingency" &&
          accessibilityInfo?.contingency_item_excel_export && (
            <Button
              className={"px-4"}
              title={"Export Contingency Items"}
              onClick={handleContingencyExport}
            >
              <LuDownload size={14} />
              Export
            </Button>
          )}
      </div>
      {/* project registration item details */}
      {showItemDetails[selectedCatagory] && (
        <div className="border-1 p-4 rounded-md">
          <p className="text-zinc-800 text-base font-bold tracking-tight mb-2">
            {selectedCatagory === "Electrical" &&
              "Project Registration Items: BOS-Electrical"}
            {selectedCatagory === "Mechanical" &&
              "Project Registration Items: BOS-Structure"}
            {selectedCatagory === "Inroof" &&
              "Project Registration Items: Inroof"}
            {selectedCatagory === "Other Structure" &&
              "Project Registration Items: Other Structure"}
          </p>
          {["Electrical", "Mechanical", "Inroof", "Other Structure"].includes(
            selectedCatagory
          ) ? (
            <div className="overflow-x-auto">
              <Table
                rows={
                  sections[engineeringCategory][0]
                    .project_registration_product_detail
                }
                columns={tableHeaderForElectricalAndMechanical}
              />
            </div>
          ) : (
            <>
              {sections[selectedCatagory][0]
                .project_registration_product_detail_installation?.length >
                0 && (
                  <>
                    <p className="text-zinc-800 text-base font-bold tracking-tight mb-2">
                      Project Registration Items: Installation & Commissioning
                    </p>
                    <div className="overflow-x-auto">
                      <Table
                        className="mb-4"
                        rows={
                          sections[selectedCatagory][0]
                            .project_registration_product_detail_installation
                        }
                        columns={tableHeaderForInstallation}
                      />
                    </div>
                  </>
                )}

              {sections[selectedCatagory][0]
                .project_registration_product_detail_net_metring_liasioning
                ?.length > 0 && (
                  <>
                    <p className="text-zinc-800 text-base font-bold tracking-tight mb-2">
                      Project Registration Items: Net Metering and Liasioning
                    </p>
                    <div className="overflow-x-auto">
                      <Table
                        rows={
                          sections[selectedCatagory][0]
                            .project_registration_product_detail_net_metring_liasioning
                        }
                        columns={tableHeaderForInstallation}
                      />
                    </div>
                  </>
                )}
            </>
          )}
        </div>
      )}

      {isLoading ? (
        <Loading />
      ) : (
        <>
          {["Electrical", "Mechanical", "Inroof", "Other Structure"].includes(
            selectedCatagory
          ) && (
              <span className="flex justify-between">
                <h4 className="text-zinc-800 text-xl font-bold tracking-tight">
                  Sections
                </h4>

                {/* Only Electrical and Mechanical leads can edit or add details in Electrical and Mechanical sections respectively */}
                {!projectDetails?.is_bbu_approved &&
                  accessibilityInfo?.add_view && (
                    <div className="flex gap-2">
                      {/* Create BOM button should only be displayed for Electrical and Mechanical sections */}
                      {[
                        "Electrical",
                        "Mechanical",
                        "Inroof",
                        "Other Structure",
                      ].includes(selectedCatagory) &&
                        showSampleButton[selectedCatagory] && (
                          <Button
                            className={"px-2"}
                            onClick={handleDataForCreateBOM}
                          >
                            Create BOM
                          </Button>
                        )}

                      {["Electrical", "Mechanical"].includes(selectedCatagory) &&
                        !showSampleButton[selectedCatagory] && (
                          <span className="flex gap-3">
                            <Button
                              className=" px-2  "
                              onClick={() => router.push("/masters/bom-template")}
                            >
                              Create BOM Sample Template
                            </Button>
                          </span>
                        )}
                    </div>
                  )}
              </span>
            )}

          {/* create bom starts here */}
          {showCreateBom[selectedCatagory] && (
            <>
              <div className="flex justify-between items-end">
                <SelectForObjects
                  mandatory={true}
                  margin={"0px"}
                  height={"36px"}
                  className={"w-[15rem]"}
                  setselected={onSelectSection}
                  selected={
                    sectionList.find((section) => section.id == selectedSection)
                      ?.name
                  }
                  options={sectionList}
                  optionName={"name"}
                  placeholder="Name"
                  dropdownLabel={"Section"}
                // canAdd={true}
                // onAddClick={() => openModal("add-section")}
                />{" "}
                <div className="flex gap-2">
                  {" "}
                  <Button
                    onClick={() => openModal("item-bom" + selectedSection)}
                    variant={"inverted"}
                    disabled={!selectedSection || selectedSection === ""}
                    customText={"#F47920"}
                    className="bg-orange-400/10 text-primary px-2 hover:bg-orange-600/10 "
                  >
                    <FaPlusCircle />
                    Add Item
                  </Button>
                  <AddItemModal
                    id={"-bom" + selectedSection}
                    onSubmit={addItemHandler}
                    sectionName={selectedSection}
                    products={products}
                  />
                  <Button
                    onClick={onCancelCreateBom}
                    variant={"inverted"}
                    customText={"#F47920"}
                    className="border-1 h-[29px] hover:bg-slate-100  bg-white px-2  "
                  >
                    <LuX size={15} />
                    Cancel
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
                </div>
              </div>

              <ProjectItemTable
                isEditMode={isEditMode}
                valueHandler={valueHandler}
                rows={bomTemplateProductList}
                columns={tableHeaderForCreateBom}
                onRowClick={() => { }}
                onDeleteRow={handleDeleteRow}
                canDelete={true}
                errorRows={errorRows}
              />
            </>
          )}

          {/* section list starts here */}
          {sections &&
            sections[engineeringCategory] &&
            sections[engineeringCategory]?.map((section) => {
              return (
                <Section
                  tab="Engineering"
                  tableHeader={tableHeaderForSection}
                  key={section.id}
                  section={section}
                  selectedCatagory={selectedCatagory}
                  userInfo={userInfo}
                  projectHeadsId={projectHeadsId}
                  products={products}
                />
              );
            })}

          {/* project installation details */}
          {["Installation", "Freight", "Other"].includes(selectedCatagory) && (
            <ProjectInstallationFreight
              activeSubTab={selectedCatagory}
              showAddButton={
                projectDetails?.planning_section_approval !== "Approved" ||
                (projectDetails?.planning_section_approval === "Approved" &&
                  userInfo?.role === "admin")
              }
              isContingency={
                projectDetails?.planning_section_approval === "Approved"
              }
              totalItems={installationItems}
              onSuccessfullSubmit={onSuccessfullSubmit}
              isPlanningApproved={
                projectDetails?.planning_section_approval === "Approved"
              }
            />
          )}

          {/* MDL for Electrical and Mechanical sections */}
          {selectedCatagory === "MDL" && (
            <ProjectMDL userInfo={userInfo} projectHeadsId={projectHeadsId} />
          )}
        </>
      )}

      {selectedCatagory === "Contingency" && (
        <ProjectContingency
          contigencyBomList={contigencyBomList}
          header={tableHeaderForContingency}
          contingencyItemList={projectDetails?.bom_item_contingency_list}
          installationFreightItems={installationItems.filter(
            (item) => item.is_contigency
          )}
          onSuccessfullDelete={fetchProjectContigency}
        />
      )}
    </div>
  );
};

export default ProjectEngineering;
