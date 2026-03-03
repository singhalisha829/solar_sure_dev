import { useState, useEffect } from "react";
import Table from "../../Table";
import { SelectForObjects } from "../../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { addCommasToNumber } from "@/utils/numberHandler";

const ProjectContingency = ({
  installationFreightItems,
  contingencyItemList,
  projectCapacity,
  tab,
}) => {
  const [activeTab, setActiveTab] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [contigencyList, setContingencyList] = useState(null);
  const [selectedContingencyCategory, setSelectedContingencyCategory] =
    useState("");
  const [allCategoryBBUCost, setAllCategoryBBUCost] = useState({});
  const [tabs, setTabs] = useState([]);

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

    let tabList = [];
    if (contingencyItemList?.length > 0) {
      tabList.push("Items");
    }
    if (installationItems?.length > 0) {
      tabList.push("Installation");
    }
    if (frieghtItems?.length > 0) {
      tabList.push("Freight");
    }
    if (otherItems?.length > 0) {
      tabList.push("Other");
    }

    setTabs(tabList);
    setActiveTab(
      contingencyItemList?.length > 0
        ? "Items"
        : installationItems?.length > 0
          ? "Installation"
          : frieghtItems?.length > 0
            ? "Freight"
            : "Other"
    );
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

  return (
    <>
      <div className="flex w-full items-end justify-between">
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

        {activeTab === "Items" && (
          <SelectForObjects
            margin={"0px"}
            height={"36px"}
            className={"w-[13rem]"}
            mandatory={true}
            setselected={(value) => setSelectedContingencyCategory(value)}
            selected={selectedContingencyCategory}
            options={categoryList}
            optionName={"name"}
            placeholder="Select"
          />
        )}
      </div>

      {activeTab === "Items" && (
        <>
          {selectedContingencyCategory === "All" ? (
            <>
              {tab === "Planning" && (
                <p className="text-zinc-800 text-base font-bold tracking-tight">
                  Total Contigency (BBU Amount: ₹
                  {addCommasToNumber(allCategoryBBUCost.totalCategoryCost)})
                </p>
              )}
              {Object.keys(contigencyList).map((category) => (
                <div key={category}>
                  {tab === "Planning" && (
                    <p className="text-zinc-500 text-base font-bold tracking-tight">
                      {category} (BBU Contingency Amount: ₹
                      {addCommasToNumber(
                        allCategoryBBUCost[category].totalAmount
                      )}
                      )
                    </p>
                  )}
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
                <p className="text-zinc-800 text-base font-bold tracking-tight">
                  BBU Contingency Amount: ₹
                  {addCommasToNumber(totalItemBbuAmount)}
                </p>
              )}
              <div className="overflow-x-auto">
                <Table
                  rows={contigencyList?.[selectedContingencyCategory] ?? []}
                  columns={tableHeaderForItems}
                />
              </div>
            </>
          )}
        </>
      )}
      {activeTab === "Installation" && (
        <>
          {tab === "Planning" && (
            <p className="text-zinc-800 text-base font-bold tracking-tight">
              BBU Amount: ₹{addCommasToNumber(totalInstallationBbuAmount)}
            </p>
          )}
          <Table
            rows={installationItems}
            columns={tableHeaderForInstallation}
          />
        </>
      )}
      {activeTab === "Freight" && (
        <>
          {tab === "Planning" && (
            <p className="text-zinc-800 text-base font-bold tracking-tight">
              BBU Amount: ₹{addCommasToNumber(totalFreightBbuAmount)}
            </p>
          )}
          <Table rows={frieghtItems} columns={tableHeaderForInstallation} />
        </>
      )}
      {activeTab === "Other" && (
        <>
          {tab === "Planning" && (
            <p className="text-zinc-800 text-base font-bold tracking-tight">
              BBU Amount: ₹{addCommasToNumber(totalOtherBbuAmount)}
            </p>
          )}
          <Table rows={otherItems} columns={tableHeaderForInstallation} />
        </>
      )}
    </>
  );
};

export default ProjectContingency;
