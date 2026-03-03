import { useState, useEffect } from "react";
import Input from "@/components/formPage/Input";
import { SelectForObjects } from "@/components/formPage/MultiSelectDropdown/MultiSelectDropdown";
import { useVendors } from "@/contexts/vendors";
import Button from "@/components/shared/Button";
import {
  editLedger,
  getProducts,
  getLedger,
  deleteLedger,
} from "@/services/api";
import { toast } from "sonner";
import { requestHandler } from "@/services/ApiHandler";
import { useRouter } from "next/router";
import { useModal } from "@/contexts/modal";
import { FaPlusCircle, FaEye } from "react-icons/fa";
import EditableTable from "@/components/project-components/EditableTable";
import { handleFileUpload } from "@/utils/documentUploadHandler";
import { MdArrowForwardIos } from "react-icons/md";
import dynamic from "next/dynamic";
import Papa from "papaparse";
import UploadFile from "@/components/formPage/UploadFileInput";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import Table from "@/components/SortableTable";
import { LocalStorageService } from "@/services/LocalStorageHandler";

const StockInProductModal = dynamic(
  () => import("@/components/modals/StockInProductModal")
);
const WarningModal = dynamic(() => import("@/components/modals/WarningModal"));

const EditLedger = () => {
  const { openModal, closeModal } = useModal();
  const { vendors } = useVendors();
  const router = useRouter();
  const { ledgerId } = router.query;
  const [products, setProducts] = useState();
  const [errorItems, setErrorItems] = useState([]);
  const [formData, setFormData] = useState({});
  const [editedData, setEditedData] = useState({});
  const [selectedRow, setSelectedRow] = useState(null);

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility")?.accessibility[0].inventory ??
    {};

  const editableTableHeader = [
    {
      name: "Product ID",
      key: "product_code",
      type: "disabled",
      width: "w-[30%]",
    },
    {
      name: "Product Name",
      key: "product_name",
      keyValue: "product",
      width: "w-[40%]",
    },
    {
      name: "Quantity",
      key: "quantity",
      key2: "unit",
    },
    {
      name: "Unit Price",
      key: "unit_price",
    },
  ];

  const fixedTableHeader = [
    {
      name: "Product ID",
      key: "product_code",
      type: "disabled",
      width: "20%",
    },
    {
      name: "Product Name",
      key: "product_name",
      keyValue: "product",
      width: "30%",
    },
    {
      name: "Quantity",
      type: "quantity_object",
      key: "quantity",
      width: "15%",
    },
    {
      name: "Unit Price",
      key: "unit_price",
      width: "15%",
    },
    {
      name: "Inventory Left Qty",
      key: "left_inventory_after_booking",
      width: "15%",
      type: "quantity_object",
    },
    {
      name: "Actions",
      type: "delete-ledger-items",
      width: "5%",
      onClickDelete: (row) => {
        setSelectedRow(row);
        openModal("delete-ledger-item-warning");
      },
    },
  ];

  useEffect(() => {
    fetchLedgerDetails({ id: ledgerId });
    fetchProductHandler();
  }, []);

  const fetchLedgerDetails = async (queryParams = {}) => {
    await requestHandler(
      async () => await getLedger(queryParams),
      null,
      (data) => {
        setFormData({
          ...data.data.output[0],
          product_details: [],
        });
      },
      toast.error
    );
  };

  const handleDeleteItems = async () => {
    const formDetails = {
      product_details: [
        {
          transaction_type: "DEBIT",
          product: selectedRow.product,
          quantity: selectedRow.quantity.quantity,
          unit: selectedRow.quantity.unit,
          unit_price: selectedRow.unit_price,
          stockin_product_id: selectedRow.id,
        },
      ],
    };

    await requestHandler(
      async () => await editLedger(formData.id, formDetails),
      null,
      async (data) => {
        toast.success("Ledger Saved Successfully...");
        closeModal("delete-ledger-item-warning");
        fetchLedgerDetails({ id: ledgerId });
        fetchProductHandler();
      },
      toast.error
    );
  };

  const handleDeleteLedger = async () => {
    await requestHandler(
      async () => await deleteLedger(formData.id),
      null,
      async (data) => {
        toast.success("Ledger Deleted Successfully...");
        router.push("/inventory/ledger/");
        closeModal("delete-ledger");
      },
      toast.error
    );
  };

  const fetchProductHandler = async (filteredObj = {}) => {
    await requestHandler(
      async () => getProducts(filteredObj),
      null,
      (data) => setProducts(data.data.output),
      toast.error
    );
  };

  // add new part in the list on clicking the check icon
  const onSubmit = async () => {
    const keysToCheck = {
      document_id: "Invoice No",
      vendor: "Vendor",
      po_no: "PO Number",
    };

    const validationResult = checkSpecificKeys(formData, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    let formDetails = {};

    formDetails = {
      ...editedData,
      product_details:
        editedData.product_details?.length > 0
          ? editedData.product_details.map((product) => {
            let product_detail = {
              product: product.product,
              quantity: product.quantity,
              unit: product.unit,
              transaction_type: "CREDIT",
            };
            if (product.unit_price !== "") {
              product_detail = {
                ...product_detail,
                unit_price: product.unit_price,
              };
            }
            return product_detail;
          })
          : [],
    };

    await requestHandler(
      async () => await editLedger(formData.id, formDetails),
      null,
      async (data) => {
        toast.success("Ledger Saved Successfully...");
        router.push("/inventory/ledger/");
      },
      toast.error
    );
  };

  const handleProductList = (data) => {
    let list = formData.product_details;
    list.push(data);
    setFormData({ ...formData, product_details: list });
    setEditedData({ ...editedData, product_details: list });
  };

  const editProductList = (data, index) => {
    removeValidItemFromErrorList(data);
    let list = formData.product_details;
    list[index] = data;
    setFormData({ ...formData, product_details: list });
    setEditedData({ ...editedData, product_details: list });
  };

  const clearFormHandler = () => {
    setErrorItems([]);
    setFormData({
      ledger_items: formData.ledger_items,
      document_id: "",
      po_no: "",
      stock_in_date: "",
      vendor: "",
      vendor_name: "",
      product_details: [],
      invoice_amount: 0,
      remark: "",
      invoice_date: "",
      invoice_doc: "",
    });
    setEditedData({});
  };

  const removeValidItemFromErrorList = (data) => {
    const errorItemIndex = errorItems.findIndex(
      (item) =>
        item.product_code.toLowerCase() == data.product_code.toLowerCase() ||
        item.product_code.toLowerCase() == data.old_product_code.toLowerCase()
    );

    if (errorItemIndex !== -1) {
      let error_item_list = errorItems;
      error_item_list.splice(errorItemIndex, 1);
      setErrorItems(error_item_list);
    }
  };

  const deleteRow = (index) => {
    removeValidItemFromErrorList(formData.product_details[index]);

    let list = [...formData.product_details];
    list.splice(index, 1);
    setFormData({ ...formData, product_details: list });
    setEditedData({ ...editedData, product_details: list });
  };

  const uploadInvoiceDocument = async (e) => {
    const response = await handleFileUpload(e.target.files[0]);
    if (response.type === "success") {
      setFormData({ ...formData, invoice_doc: response.data });
      setEditedData({ ...editedData, invoice_doc: response.data });
    } else {
      toast.error(response.error || "Oops! Something went wrong");
    }
  };

  const handleFileChange = (file) => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        let item_list = [],
          error_items = [];
        results.data.map((product) => {
          if (product.product_code && product.product_code !== "") {
            const selectedProduct = products.find(
              (item) =>
                item.product_code.trim().toLowerCase() ==
                product.product_code.trim().toLowerCase()
            );
            product.unit_price =
              !product.unit_price || product.unit_price == ""
                ? 0
                : product.unit_price;

            // check if the entered product exists and quantity, unit price contains numerical value
            if (!selectedProduct) {
              error_items.push(product);
              item_list.push(product);
            } else if (
              typeof product.quantity !== "number" ||
              typeof product.unit_price !== "number"
            ) {
              error_items.push(product);
              item_list.push({
                ...product,
                product_code: product.product_code.trim(),
                product: selectedProduct.id,
                product_name: selectedProduct.name,
                unit: selectedProduct.inventory.unit,
              });
            } else {
              item_list.push({
                ...product,
                product_code: product.product_code.trim(),
                product: selectedProduct.id,
                product_name: selectedProduct.name,
                unit: selectedProduct.inventory.unit,
              });
            }
          }
        });
        setFormData({
          ...formData,
          product_details: [...formData.product_details, ...item_list],
        });
        setEditedData({
          ...editedData,
          product_details: [
            ...(editedData?.product_details ?? []),
            ...item_list,
          ],
        });
        setErrorItems(error_items);
        // console.log(results.data, item_list, error_items);
      },
      error: (error) => {
        toast.error(`Error parsing CSV:${error}`);
      },
    });
  };

  const valueHandler = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setEditedData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="flex text-xl font-bold tracking-tight">
          <span
            className="flex text-primary hover:underline underline-offset-4 cursor-pointer"
            onClick={() => router.push("/inventory/ledger/")}
          >
            Ledger
          </span>
          <MdArrowForwardIos className="mt-1 text-primary" />
          Edit Ledger Details
        </h2>
        {formData?.ledger_items?.length === 0 &&
          accessibilityInfo?.ledger_delete && (
            <Button
              onClick={() => openModal("delete-ledger")}
              variant={"inverted"}
              size={"small"}
              customText={"#F47920"}
              className="bg-red-400/10 text-red-500 px-2 hover:bg-red-600/10 "
            >
              Delete
            </Button>
          )}
      </div>

      <div className=" bg-white rounded p-5 min-h-[50vh]">
        <div className="flex flex-col gap-4 p-5 border border-zinc-100 rounded-md grow h-full">
          <div className="grid grid-cols-3 gap-4">
            <Input
              type="text"
              value={formData.document_id}
              onChange={valueHandler}
              name="document_id"
              mandatory={true}
              placeholder={"Enter Invoice Number"}
              label={"Invoice Number"}
            />

            <SelectForObjects
              margin={"0px"}
              height={"36px"}
              setselected={(name, id) => {
                setFormData({
                  ...formData,
                  vendor: id,
                  vendor_name: name,
                });
                setEditedData({
                  ...editedData,
                  vendor: id,
                  vendor_name: name,
                });
              }}
              mandatory={true}
              selected={formData.vendor_name}
              options={vendors}
              optionName={"name"}
              optionID={"id"}
              placeholder="Select Name"
              dropdownLabel={"Select Vendor"}
            />

            <Input
              type="text"
              value={formData.po_no}
              onChange={valueHandler}
              name={"po_no"}
              mandatory={true}
              placeholder={"Enter PO Number"}
              label={"PO Number"}
            />

            <Input
              type="date"
              value={formData.stock_in_date}
              onChange={valueHandler}
              name={"stock_in_date"}
              mandatory={true}
              placeholder={"Name..."}
              label={"Stock In Date"}
            />

            <Input
              type="number"
              value={formData.invoice_amount}
              onChange={valueHandler}
              name={"invoice_amount"}
              label={"Invoice Amount"}
            />

            <span className="flex gap-2 items-center">
              <Input
                type="file"
                value={formData.invoice_doc}
                onChange={uploadInvoiceDocument}
                label={"Invoice Document"}
              />
              {formData.invoice_doc !== "" && (
                <FaEye
                  className="cursor-pointer text-[18px]"
                  onClick={() => window.open(formData.invoice_doc, "_blank")}
                />
              )}
            </span>
            <Input
              type="date"
              value={formData.invoice_date}
              onChange={valueHandler}
              name="invoice_date"
              label={"Invoice Date"}
            />
            <Input
              type="textarea"
              value={formData.remark}
              onChange={valueHandler}
              name="remark"
              outerClass="col-span-2"
              placeholder={"Remarks"}
              label={"Remarks"}
            />
          </div>

          <strong>Ledger Items</strong>
          <Table
            rows={formData?.ledger_items ?? []}
            columns={fixedTableHeader}
          />

          <div className="flex justify-between items-center gap-2 mt-4">
            <strong>Add New Items</strong>

            <div className="flex gap-4">
              <UploadFile
                id={"PO Copy"}
                placeholderText={"Upload Products"}
                showFileName={true}
                uploadSingleFile={true}
                fileTypes={["csv"]}
                onFileChange={handleFileChange}
                sampleFileData={[
                  { product_code: "test", quantity: "1", unit_price: "1" },
                ]}
              />
              <Button
                onClick={() => openModal("add-stock-in-product")}
                variant={"inverted"}
                customText={"#F47920"}
                className="bg-orange-400/10 text-primary px-2 hover:bg-orange-600/10 "
              >
                <FaPlusCircle />
                Stock In Product
              </Button>
            </div>
          </div>
          <EditableTable
            isEditMode={true}
            canDelete={true}
            onDeleteRow={deleteRow}
            rows={formData.product_details ?? []}
            columns={editableTableHeader}
            onEditSuccess={editProductList}
            isModalOpenOnEdit={"edit-stock-in-product"}
            errorRows={errorItems}
            errorRowIdName={"product_code"}
          />

          {errorItems.length > 0 && (
            <div className="border-1 relative text-red-500 border-red-500 rounded p-2 bg-red-50">
              <strong>Error!</strong>
              <br />
              Please correct the data for Product(s) -{" "}
              {errorItems.map((item) => item.product_code).join(", ")} .
            </div>
          )}

          <StockInProductModal
            modalId={"add-stock-in-product"}
            onStockInItems={handleProductList}
            productList={products}
            addedItemList={[
              ...(formData?.product_details?.map((item) => item.product) || []),
              ...(formData?.ledger_items?.map((item) => item.product) || []),
            ]}
          />

          <div className=" w-full flex justify-end gap-4">
            <Button
              className=" h-[2rem] w-small"
              onClick={clearFormHandler}
              customText={"#9E9E9E"}
              variant={"gray"}
            >
              Clear
            </Button>
            <Button
              disabled={errorItems.length > 0}
              className=" h-[2rem] w-small"
              onClick={onSubmit}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
      <WarningModal
        modalId={"delete-ledger-item-warning"}
        modalContent={
          <>
            Are you sure that you want to remove{" "}
            <strong>
              {selectedRow?.product_code} ({selectedRow?.product_name})
            </strong>
            from inventory?
          </>
        }
        onSubmit={handleDeleteItems}
      />
      <WarningModal
        modalId={"delete-ledger"}
        modalContent={<>Are you sure that you want to delete this ledger?</>}
        onSubmit={handleDeleteLedger}
      />
    </>
  );
};

export default EditLedger;
