import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import ProcurementTable from "@/components/project-components/ProcurementTable";
import Button from "@/components/shared/Button";
import { useProduct } from "@/contexts/product";
import Input from "@/components/formPage/Input";
import { dateFormatInYYYYMMDD } from "@/utils/formatter";
import { createPackingList } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { MdArrowForwardIos } from "react-icons/md";
import { useProject } from "@/contexts/project";
import { FaTimes } from "react-icons/fa";
import { useVendors } from "@/contexts/vendors";
import { SelectForObjects } from "@/components/formPage/MultiSelectDropdown/MultiSelectDropdown";
import UploadFile from "@/components/formPage/UploadFileInput";
import Papa from "papaparse";

const CreatePackingList = () => {
  const router = useRouter();
  const { vendors } = useVendors();
  const { units } = useProduct();
  const { getProjectDetailsHandler } = useProject();
  const [sectionItemList, setSectionItemList] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [breadcrumbsText, setBreadcrumbsText] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [uploadProductList, setUploadProductList] = useState([]);
  const [uploadErrorItem, setUploadErrorItems] = useState(null);
  const [formDetails, setFormDetails] = useState({
    vendor: "",
    vendor_name: "",
    remark: "",
    po_number: "",
  });

  const tableHeader = [
    { name: "Item Code", width: "7rem", key: "product_code" },
    { name: "Item", width: "8rem", key: "item_name" },
    { name: "Make", width: "8rem", key: "make_name" },
    { name: "Quantity", width: "7rem", key: "quantity_new" },
    {
      name: "Packing List Quantity",
      width: "8rem",
      key: "bom_items_booked_quantity_new",
    },
    {
      name: "Left Quantity",
      width: "6rem",
      key: "bom_items_quantity_left_after_booking",
      type: "quantity_object",
    },

    { name: "Inventory", width: "7rem", key: "inventory_new" },
    { name: "Packing List Quantity", width: "8rem", key: "booked_inventory" },
    {
      name: "Left Quantity",
      width: "5rem",
      key: "left_inventory_after_booking",
    },

    {
      name: "Quantity",
      width: "8rem",
      key: "item_quantity",
      type: "packing_list_quantity_field",
    },
    {
      name: "Remark",
      width: "18rem",
      key: "remark",
      type: "text",
    },
  ];
  const parentTableHeader = [
    { name: "", colSpan: 1 },
    { name: "", colSpan: 1 },
    { name: "", colSpan: 1 },
    { name: "BOM", colSpan: 3 },
    { name: "Inventory", colSpan: 3 },
    { name: "", colSpan: 1 },
    { name: "", colSpan: 1 },
  ];
  const [tableHeaderList, setTableHeaderList] = useState(tableHeader);
  const [parentTableHeaderList, setParentTableHeaderList] =
    useState(parentTableHeader);

  useEffect(() => {
    const item_list = LocalStorageService.get("packing-list-items")?.bom_heads;
    if (Object.keys(item_list)?.length > 0) {
      let list = {},
        uploadList = [];
      Object.keys(item_list).map((section) => {
        const combinedBomHeads = item_list[section].reduce(
          (accumulator, currentValue) => {
            let itemList = [];
            currentValue.bom_items.map((item) => {
              /**  filter the following items :
              1. which are completely packed
              2. and items for which planning is not done
              */
              if (
                item.bom_items_quantity_left_after_booking.quantity != 0 &&
                item.bbu_total_price !== null &&
                item.bbu_total_price != 0
              ) {
                itemList.push(item);
                if (
                  item.left_inventory_after_booking &&
                  item.left_inventory_after_booking.split(" ")[0] > 0
                ) {
                  uploadList.push(item);
                }
              }
            });
            return accumulator.concat(itemList);
          },
          []
        );
        if (combinedBomHeads.length > 0) {
          list[section] = combinedBomHeads;
        }
      });
      setSectionItemList(list);
      setUploadProductList(uploadList);
      setProjectId(LocalStorageService.get("packing-list-items")?.project_id);
      setBreadcrumbsText(
        LocalStorageService.get("packing-list-items")?.project_details
      );
    }
  }, []);

  const onChangeHandler = (section, index, key, value) => {
    let item_list = sectionItemList;
    item_list[section][index][key] = value;
    setSectionItemList({ ...item_list });
  };

  const handleOnSubmit = async () => {
    if (formDetails.vendor_name == "") {
      toast.error("Field Vendor is empty!");
      return;
    }

    if (
      formDetails.vendor_name !== "SolarSure" &&
      formDetails.po_number == ""
    ) {
      toast.error("Field PO Number is empty!");
      return;
    }

    let list = [];
    Object.keys(sectionItemList).map((section) => {
      sectionItemList[section].map((item) => {
        if (
          item.item_quantity &&
          item.item_quantity != 0 &&
          item.item_quantity !== ""
        ) {
          list.push({
            project_bom_item: item.id,
            quantity: item.item_quantity,
            unit: units.filter((unit) => item.inventory.unit == unit.symbol)[0]
              ?.id,
            remark: item.remark ?? "",
          });
        }
      });
    });

    if (list.length == 0) {
      toast.error("Please enter data for at least one Item!");
      return;
    }

    const apiData = {
      date: dateFormatInYYYYMMDD(new Date()),
      project: projectId,
      transaction_type: "CREDIT",
      product_details: list,
      ...formDetails,
    };

    await requestHandler(
      async () => await createPackingList(apiData),
      null,
      async (data) => {
        if (data.status.error) {
          let error = {
            bom_item_quantity_error:
              data.status.error.bom_item_quantity_error.map(
                (item) =>
                  `${item.project_bom_item_code}(${item.project_bom_item_name})`
              ),
            inventory_item_quantity_error:
              data.status.error.inventory_item_quantity_error.map(
                (item) =>
                  `${item.project_bom_item_code}(${item.project_bom_item_name})`
              ),
          };
          LocalStorageService.set("packing-list-error", error);
        } else {
          LocalStorageService.set("packing-list-error", null);
        }
        toast.success("Packing List Created Successfully!");
        router.back();
        getProjectDetailsHandler();
      },
      (error, data) => {
        toast.error(data.status.description);
        let errorMessage = {
          bom_item_quantity_error:
            data.status.error.bom_item_quantity_error.map(
              (item) =>
                `${item.project_bom_item_code}(${item.project_bom_item_name})`
            ),
          inventory_item_quantity_error:
            data.status.error.inventory_item_quantity_error.map(
              (item) =>
                `${item.project_bom_item_code}(${item.project_bom_item_name})`
            ),
        };
        setErrorMessage(errorMessage);
      }
    );
  };

  const handleTableHeader = (name) => {
    let list = tableHeader;
    let parentList = parentTableHeader;

    if (name !== "SolarSure") {
      list.splice(6, 3);
      parentList.splice(4, 1);
    }
    setParentTableHeaderList(parentList);
    setTableHeaderList(list);
  };

  const handleFileChange = (file) => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        let error_items = {
          invalid_product: [],
          bom_quantity_error: [],
          inventory_quantitiy_error: [],
        };
        results.data.map((product) => {
          // dont check for empty rows
          if (product.quantity && product.quantity !== "") {
            // check if given product code exists in the list of applicable products
            const index = uploadProductList.findIndex(
              (item) => item.product_code === product.product_code
            );
            if (index !== -1) {
              // check if the entered quantity is not greater than required bom quantity and quantity left in inventory
              if (
                product.quantity >
                uploadProductList[index].bom_items_quantity_left_after_booking
                  .quantity
              ) {
                error_items.bom_quantity_error.push(product);
              } else if (
                product.quantity >
                uploadProductList[index].left_inventory_after_booking.split(
                  " "
                )[0]
              ) {
                error_items.inventory_quantitiy_error.push(product);
              } else {
                // valid case
                searchInSectionList(
                  uploadProductList[index].id,
                  product.quantity,
                  product.remark
                );
              }
            } else {
              error_items.invalid_product.push(product);
            }
          }
        });
        setUploadErrorItems(error_items);
      },
      error: (error) => {
        toast.error(`Error parsing CSV:${error}`);
      },
    });
  };

  const searchInSectionList = (id, quantity, remark) => {
    // Label for the outer loop
    outerLoop: for (const section in sectionItemList) {
      for (let index = 0; index < sectionItemList[section].length; index++) {
        const item = sectionItemList[section][index];
        if (item.id == id) {
          onChangeHandler(section, index, "item_quantity", quantity);
          onChangeHandler(section, index, "remark", remark);
          break outerLoop; // Break out of both loops
        }
      }
    }
  };

  const resetItemList = () => {
    const list = sectionItemList;
    for (const category in list) {
      if (list.hasOwnProperty(category)) {
        list[category].forEach((item) => {
          item.item_quantity = ""; // Empty the quantity field
          item.remark = ""; // Empty the remarks field
        });
      }
    }
    setSectionItemList(list);
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className=" flex text-xl font-bold tracking-tight">
          <span
            className="text-primary hover:underline underline-offset-4 cursor-pointer"
            onClick={() => router.back()}
          >
            {breadcrumbsText}
          </span>
          <MdArrowForwardIos className="mt-1 text-primary" />
          Create Packing List
        </h2>
      </div>

      {errorMessage && (
        <div className="border-1 relative text-red-500 border-red-500 rounded p-2 bg-red-50">
          <FaTimes
            className="absolute right-2 top-2 cursor-pointer"
            onClick={() => {
              LocalStorageService.set("packing-list-error", null);
              setErrorMessage(null);
            }}
          />
          <strong>Error!</strong>
          <br />
          {errorMessage.bom_item_quantity_error.length > 0 && (
            <>
              <span>
                BOM Items -{" "}
                <strong>
                  {errorMessage?.bom_item_quantity_error
                    .map((item) => item)
                    .join(", ")}{" "}
                </strong>
                have already been booked.
              </span>
              <br />
            </>
          )}
          {errorMessage.inventory_item_quantity_error.length > 0 && (
            <span>
              BOM Items -{" "}
              <strong>
                {errorMessage?.inventory_item_quantity_error
                  .map((item) => item)
                  .join(", ")}
              </strong>{" "}
              have less quantity available compared to the quantity being
              booked.
            </span>
          )}
        </div>
      )}

      {(uploadErrorItem?.invalid_product.length > 0 ||
        uploadErrorItem?.bom_quantity_error.length > 0 ||
        uploadErrorItem?.inventory_quantitiy_error.length > 0) && (
          <div className="border-1 relative text-red-500 border-red-500 rounded p-2 bg-red-50">
            <FaTimes
              className="absolute right-2 top-2 cursor-pointer"
              onClick={() => setUploadErrorItems(null)}
            />
            {uploadErrorItem?.invalid_product.length > 0 && (
              <>
                <span>
                  BOM Item(s) -{" "}
                  <strong>
                    {uploadErrorItem.invalid_product
                      .map((item) => item.product_code)
                      .join(", ")}
                  </strong>{" "}
                  is not present in the provided Item list.
                </span>
                <br />
              </>
            )}
            {uploadErrorItem?.bom_quantity_error.length > 0 && (
              <>
                <span>
                  The quantity provided for the BOM item(s) -{" "}
                  <strong>
                    {uploadErrorItem.bom_quantity_error
                      .map((item) => item.product_code)
                      .join(", ")}
                  </strong>{" "}
                  exceeds the required quantity.
                </span>
                <br />
              </>
            )}

            {uploadErrorItem?.inventory_quantitiy_error.length > 0 && (
              <span>
                The quantity provided for the BOM item(s) -{" "}
                <strong>
                  {uploadErrorItem.inventory_quantitiy_error
                    .map((item) => item.product_code)
                    .join(", ")}
                </strong>{" "}
                exceeds the quantity left in inventory.
              </span>
            )}
          </div>
        )}
      <div className=" bg-white rounded  overflow-scroll p-5">
        <div className="relative flex flex-col gap-4 p-5 border border-zinc-100  overflow-scroll rounded-md grow h-full">
          <div className=" gap-4 items-end flex justify-between">
            <div className="flex gap-4">
              <SelectForObjects
                margin={"0px"}
                mandatory
                height={"36px"}
                setselected={(name, id) => {
                  setFormDetails({
                    ...formDetails,
                    vendor: id,
                    vendor_name: name,
                  });
                  resetItemList();
                  handleTableHeader(name);
                }}
                selected={formDetails.vendor_name}
                options={vendors}
                optionName={"name"}
                optionID={"id"}
                placeholder="Select.."
                dropdownLabel="Dispatch From"
              />
              <Input
                type="text"
                outerClass={"w-[30rem]"}
                value={formDetails.po_number}
                mandatory={
                  formDetails.vendor_name !== "SolarSure" ? true : false
                }
                onChange={(e) =>
                  setFormDetails({ ...formDetails, po_number: e.target.value })
                }
                label={"PO Number"}
              />
            </div>

            <UploadFile
              id={"PO Copy"}
              placeholderText={
                uploadProductList.length === 0 ? (
                  <span className="text-red-500">
                    Listed Item not available in Inventory
                  </span>
                ) : (
                  "Upload Products"
                )
              }
              showFileName={true}
              uploadSingleFile={true}
              fileTypes={["csv"]}
              onFileChange={handleFileChange}
              isDisabled={uploadProductList.length === 0}
              sampleFileData={uploadProductList.map((item) => ({
                product_code: item.product_code,
                required_quantity:
                  item.bom_items_quantity_left_after_booking.quantity,
                inventory_items_left_after_booking:
                  item.left_inventory_after_booking.split(" ")[0],
                quantity: "",
                remark: "",
              }))}
            />
          </div>
          {Object.keys(sectionItemList)?.map((section, index) => {
            return (
              <div key={index} className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <p className="text-zinc-800 text-xl font-bold tracking-tight">
                    {section}
                  </p>
                </div>
                <div className="overflow-scroll">
                  <ProcurementTable
                    rows={sectionItemList[section]}
                    parentTableHeader={parentTableHeaderList}
                    columns={tableHeaderList}
                    onChangeHandler={(index, key, value) =>
                      onChangeHandler(section, index, key, value)
                    }
                    selectedVendor={formDetails.vendor_name}
                  />
                </div>
              </div>
            );
          })}

          <Input
            type="textarea"
            value={formDetails.remark}
            onChange={(e) =>
              setFormDetails({ ...formDetails, remark: e.target.value })
            }
            label={"Remark"}
            className="mt-2"
          />

          <div className=" w-full flex justify-end gap-2.5">
            <Button
              variant="inverted"
              className=" w-[5rem] mr-2 border bg-white border-dark-bluish-green px-2 text-xs"
              customText={true}
            >
              Clear
            </Button>
            <Button className=" h-[2rem] w-small" onClick={handleOnSubmit}>
              Submit
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePackingList;
