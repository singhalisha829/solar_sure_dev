import { useState, useEffect } from "react";
import Table from "../../../SortableTable";
import { getBOMContigency, deleteContingencyRemark } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { useModal } from "@/contexts/modal";
import dynamic from "next/dynamic";
import { SelectForObjects } from "@/components/formPage/MultiSelectDropdown/MultiSelectDropdown";
import { addCommasToNumber } from "@/utils/numberHandler";
import Button from "@/components/shared/Button";
import { useRouter } from "next/router";
import { downloadContingencyDoc } from "@/services/contingencyService";

const ContingencyItemsModal = dynamic(
  () =>
    import(
      "@/components/modals/ProjectDetails/ProjectContingency/ContingencyDetailsModal"
    )
);

const DeleteWarningModal = dynamic(
  () => import("../../../modals/WarningModal")
);

const ProjectContingency = ({
  contigencyBomList,
  installationFreightItems,
  contingencyItemList,
  projectCapacity,
  tab,
  onSuccessfullDelete,
}) => {
  const router = useRouter();
  const { projectName, projectId } = router.query;
  const { openModal, closeModal } = useModal();
  const [selectedContingency, setSelectedContingency] = useState("");
  const [modalTabs, setModalTabs] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [subTabs, setSubTabs] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState("");
  const [selectedContingencyCategory, setSelectedContingencyCategory] =
    useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [otherCategoryList, setOtherCategoryList] = useState([]);
  const [allCategoryBBUCost, setAllCategoryBBUCost] = useState({});
  const [contigencyList, setContingencyList] = useState(null);
  const [selectedBomContingencyId, setSelectedBomContingencyId] =
    useState(null);

  const fetchParticularContigencyDetails = async (id) => {
    await requestHandler(
      async () => await getBOMContigency({ id: id }),
      null,
      (data) => {
        let item_list = [],
          other_item_list = [];
        data.data.output[0].item_list.map((item) => {
          if (
            ["Installation", "Freight", "Other"].includes(item.bom_head_name)
          ) {
            other_item_list.push(item);
          } else {
            item_list.push(item);
          }
        });
        if (item_list.length > 0) {
          modalTabs.push("Items");
        }
        if (other_item_list.length > 0) {
          modalTabs.push("Others");
        }
        setSelectedContingency({
          ...data.data.output[0],
          item_list: item_list,
          other_item_list: other_item_list,
        });
        openModal("display-contingency-items");
      },
      toast.error
    );
  };

  const deleteParticularContigencyDetails = async (id) => {
    await requestHandler(
      async () => await deleteContingencyRemark(id),
      null,
      (data) => {
        toast.success("Contingency Deleted Successfully!");
        closeModal("delete-project-contignecy");
        onSuccessfullDelete();
      },
      toast.error
    );
  };

  const tableHeader = [
    { name: "Contingency No.", width: "10rem", key: "contingency_no" },
    { name: "No. of Items", width: "8rem", key: "item_list_qty" },
    {
      name: "Total Amount(₹)",
      width: "10rem",
      key: "total_amount",
      displayType: "price",
    },
    { name: "Contingency Remark", width: "20rem", key: "remark" },
    { name: "Status", width: "8rem", key: "status" },
    { name: "Created By", width: "8rem", key: "created_by" },
    {
      name: "Approval Doc",
      width: "8rem",
      key: "approval_doc",
      type: "file",
    },
    {
      name: "Approved By",
      key: "approved_by",
      width: "10rem",
    },
    {
      name: "Actions",
      type: "contingency-actions-column",
      actionType: "edit-delete-download",
      width: "5rem",
      onClickEdit: (row) => {
        router.push(
          `/projects/editProjectContingency/${projectId}?projectName=${projectName}&id=${row.id}`
        );
      },
      onClickDelete: (row) => {
        setSelectedContingency(row);
        openModal("delete-project-contignecy");
      },
      onClickDownload: (row) => downloadContingencyDoc(row),
    },
  ];

  const tableHeaderForInstallation = [
    {
      name: "Name",
      key: "name",
      width: "30%",
    },
    // Conditionally add the "Per Watt" column
    ...(tab === "Planning"
      ? [
          {
            name: "Per Watt",
            key: "perWatt",
            displayType: "price",
            minWidth: "20%",
          },
        ]
      : []),
    {
      name: "Amount(₹)",
      key: "amount",
      displayType: "price",
      width: "20%",
    },
    {
      name: "Description",
      key: "description",
      width: "50%",
    },
  ];

  const tableHeaderForItems = [
    { name: "Item Code", width: "10rem", key: "product_code" },
    { name: "Item", width: "10rem", key: "item_name" },
    { name: "Make", width: "15rem", key: "make_name" },
    { name: "Qty.", width: "8rem", key: "quantity", key2: "unit_name" },
    {
      name: "BBU Unit Price(₹)",
      width: "7rem",
      key: "unit_price",
      type: "number",
      displayType: "price",
    },
    // Conditionally add the "Per Watt" column
    ...(tab === "Planning"
      ? [
          {
            name: "Per Watt",
            key: "perWatt",
            displayType: "price",
            minWidth: "5rem",
          },
        ]
      : []),
    {
      name: "Total BBU Amount(₹)",
      width: "8rem",
      type: "bbu_total_price",
    },
    {
      name: "Status",
      width: "10rem",
      key: "status",
    },
    {
      name: "Remark",
      width: "20rem",
      key: "remarks",
    },
  ];

  const frieghtItems = installationFreightItems.filter(
    (item) => item.budget_type === "Freight"
  );
  const installationItems = installationFreightItems.filter(
    (item) => item.budget_type === "Installation"
  );
  const otherItems = installationFreightItems.filter(
    (item) => item.budget_type === "Other"
  );

  let totalFreightBbuAmount = 0;
  frieghtItems.map((item) => {
    totalFreightBbuAmount += Number(item.amount || 0);
    item.perWatt = Number(item.amount || 0) / (projectCapacity * 1000);
  });

  let totalInstallationBbuAmount = 0;
  installationItems.map((item) => {
    totalInstallationBbuAmount += Number(item.amount || 0);
    item.perWatt = Number(item.amount || 0) / (projectCapacity * 1000);
  });

  let totalOtherBbuAmount = 0;
  otherItems.map((item) => {
    totalOtherBbuAmount += Number(item.amount || 0);
    item.perWatt = Number(item.amount || 0) / (projectCapacity * 1000);
  });

  let totalItemBbuAmount = 0;
  contigencyList?.[selectedContingencyCategory]?.map((item) => {
    let total = Number(item.unit_price || 0) * Number(item.quantity || 0);
    totalItemBbuAmount += total;
    item.perWatt = total / ((projectCapacity || 1) * 1000);
  });

  useEffect(() => {
    // prepare contigency list and filter
    if (contingencyItemList?.length > 0) {
      const groupedData = contingencyItemList.reduce((acc, obj) => {
        const { bom_head } = obj;
        if (!acc[bom_head]) {
          acc[bom_head] = []; // Initialize array if not present
        }
        acc[bom_head].push(obj); // Add object to the array
        return acc;
      }, {});
      setContingencyList(groupedData);

      const uniqueBomHeads = [
        ...new Set(contingencyItemList.map((obj) => obj.bom_head)),
      ];
      const bomHeadsList = uniqueBomHeads.map((head) => ({ name: head }));
      setCategoryList([{ name: "All" }, ...bomHeadsList]);
      setSelectedContingencyCategory("All");
      handleCategoryCost(groupedData);
    }

    let tabList = [],
      subTabList = [],
      otherCategoryDropdownList = [{ name: "All" }];
    if (contigencyBomList?.length > 0) {
      tabList.push("Contingency List");
    }
    if (contingencyItemList?.length > 0) {
      tabList.push("Contingency Items List");
      subTabList.push("Items");
    }

    if (
      installationItems?.length > 0 ||
      frieghtItems?.length > 0 ||
      otherItems?.length > 0
    ) {
      subTabList.push("Others");
    }

    if (installationItems?.length > 0) {
      otherCategoryDropdownList.push({ name: "Installation" });
    }
    if (frieghtItems?.length > 0) {
      otherCategoryDropdownList.push({ name: "Freight" });
    }
    if (otherItems?.length > 0) {
      otherCategoryDropdownList.push({ name: "Other" });
    }

    setTabs(tabList);
    setSubTabs(subTabList);
    setActiveSubTab(contingencyItemList?.length > 0 ? "Items" : "Others");
    setActiveTab(
      contigencyBomList?.length > 0
        ? "Contingency List"
        : "Contingency Items List"
    );
    setOtherCategoryList(otherCategoryDropdownList);
  }, []);

  const handleCategoryCost = (contigencyData) => {
    let allCategoryCostDetails = {
      totalCategoryCost: 0,
    };
    Object.keys(contigencyData).map((category) => {
      allCategoryCostDetails[category] = {
        totalAmount: 0,
      };
      contigencyData?.[category].map((item) => {
        let total = Number(item.unit_price || 0) * Number(item.quantity || 0);
        allCategoryCostDetails[category].totalAmount += total;
      });

      allCategoryCostDetails.totalCategoryCost += Number(
        allCategoryCostDetails[category].totalAmount || 0
      );
    });

    setAllCategoryBBUCost(allCategoryCostDetails);
  };

  const handleContingencyApproval = () => {
    router.push(
      `/projects/approveProjectContingency/${selectedBomContingencyId}?projectName=${projectName}`
    );
  };

  return (
    <>
      <div className="flex w-full items-end justify-between">
        {tabs.length > 0 && (
          <div className="flex h-[2rem]">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveTab(tab);
                }}
                className={`mr-4 flex px-4 py-1  ${
                  activeTab === tab
                    ? "border-b-2 border-b-primary text-primary  "
                    : "border-transparent"
                } focus:outline-none`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
        <Button
          className={"px-4"}
          onClick={handleContingencyApproval}
          disabled={selectedBomContingencyId == null}
        >
          Approve Contingency
        </Button>
      </div>

      {/* contingency BOM List */}
      {activeTab === "Contingency List" && (
        <div className="overflow-auto">
          <Table
            rows={contigencyBomList ?? []}
            columns={tableHeader}
            onRowClick={(row) => fetchParticularContigencyDetails(row.id)}
            showCheckbox={true}
            onSelectCheckbox={(id) => setSelectedBomContingencyId(id)}
          />
        </div>
      )}

      {/* contingency Items List */}
      {activeTab === "Contingency Items List" && (
        <>
          <div className="flex w-full items-end justify-between">
            {subTabs.length > 0 && (
              <div className="flex h-[2rem] mb-2">
                {subTabs.map((tab, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveSubTab(tab);
                      setSelectedContingencyCategory("All");
                    }}
                    className={`mr-4 flex px-4 py-1  ${
                      activeSubTab === tab
                        ? "border-b-2 border-b-primary text-primary  "
                        : "border-transparent"
                    } focus:outline-none`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
            <SelectForObjects
              margin={"0px"}
              height={"36px"}
              className={"w-[13rem]"}
              mandatory={true}
              setselected={(value) => setSelectedContingencyCategory(value)}
              selected={selectedContingencyCategory}
              options={
                activeSubTab === "Items" ? categoryList : otherCategoryList
              }
              optionName={"name"}
              placeholder="Select"
            />
          </div>

          <div className="overflow-auto">
            {/* items category in contingency Items List */}
            {activeSubTab === "Items" && (
              <>
                {selectedContingencyCategory === "All" ? (
                  <>
                    {tab === "Planning" && (
                      <p className="text-zinc-800 text-base font-bold tracking-tight">
                        Total Contigency (BBU Amount: ₹
                        {addCommasToNumber(
                          allCategoryBBUCost.totalCategoryCost
                        )}
                        )
                      </p>
                    )}
                    {Object.keys(contigencyList).map((category) => (
                      <div key={category}>
                        <p className="text-zinc-500 text-base font-bold tracking-tight mt-2">
                          {category}{" "}
                          {tab === "Planning" && (
                            <>
                              (BBU Contingency Amount: ₹
                              {addCommasToNumber(
                                allCategoryBBUCost[category].totalAmount
                              )}
                              )
                            </>
                          )}
                        </p>
                        <div className="overflow-x-auto">
                          <Table
                            rows={contigencyList?.[category] ?? []}
                            columns={tableHeaderForItems}
                          />
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {tab === "Planning" && (
                      <p className="text-zinc-500 text-base font-bold tracking-tight">
                        {selectedContingencyCategory} (BBU Contingency Amount: ₹
                        {addCommasToNumber(totalItemBbuAmount)})
                      </p>
                    )}
                    <div className="overflow-x-auto">
                      <Table
                        rows={
                          contigencyList?.[selectedContingencyCategory] ?? []
                        }
                        columns={tableHeaderForItems}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* others category in contingency Items List */}
            {activeSubTab === "Others" && (
              <>
                {selectedContingencyCategory === "All" &&
                  tab === "Planning" && (
                    <p className="text-zinc-800 text-base font-bold tracking-tight">
                      Total Contigency (BBU Amount: ₹
                      {addCommasToNumber(
                        totalFreightBbuAmount +
                          totalInstallationBbuAmount +
                          totalOtherBbuAmount
                      )}
                      )
                    </p>
                  )}

                {installationItems.length > 0 &&
                  ["All", "Installation"].includes(
                    selectedContingencyCategory
                  ) && (
                    <>
                      {tab === "Planning" && (
                        <p className="text-zinc-500 text-base font-bold tracking-tight mt-2">
                          Installation (BBU Amount: ₹
                          {addCommasToNumber(totalInstallationBbuAmount)})
                        </p>
                      )}
                      <Table
                        rows={installationItems}
                        columns={tableHeaderForInstallation}
                      />
                    </>
                  )}

                {frieghtItems.length > 0 &&
                  ["All", "Freight"].includes(selectedContingencyCategory) && (
                    <>
                      {tab === "Planning" && (
                        <p className="text-zinc-500 text-base font-bold tracking-tight mt-2">
                          Freight (BBU Amount: ₹
                          {addCommasToNumber(totalFreightBbuAmount)})
                        </p>
                      )}
                      <Table
                        rows={frieghtItems}
                        columns={tableHeaderForInstallation}
                      />
                    </>
                  )}

                {otherItems.length > 0 &&
                  ["All", "Other"].includes(selectedContingencyCategory) && (
                    <>
                      {tab === "Planning" && (
                        <p className="text-zinc-500 text-base font-bold tracking-tight mt-2">
                          Other (BBU Amount: ₹
                          {addCommasToNumber(totalOtherBbuAmount)})
                        </p>
                      )}
                      <Table
                        rows={otherItems}
                        columns={tableHeaderForInstallation}
                      />
                    </>
                  )}
              </>
            )}
          </div>
        </>
      )}

      <ContingencyItemsModal
        modalId={"display-contingency-items"}
        width={"w-3/4"}
        modalTabs={modalTabs}
        onClose={() => setModalTabs([])}
        selectedContingency={selectedContingency}
      />
      <DeleteWarningModal
        modalId={"delete-project-contignecy"}
        modalContent={
          <>
            Are you sure you want to delete Contingency -{" "}
            <strong>{selectedContingency?.contingency_no}</strong>? This action
            is irreversible.
          </>
        }
        onSubmit={() =>
          deleteParticularContigencyDetails(selectedContingency?.id)
        }
      />
    </>
  );
};

export default ProjectContingency;
