import { useState, useEffect } from "react";
import FormModal from "../../shared/FormModal";
import Input from "../../formPage/Input";
import { SelectForObjects } from "../../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { FaEye } from "react-icons/fa";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { toast } from "sonner";
import { handleFileUpload } from "@/utils/documentUploadHandler";

const AddEditMDL = ({
  modalId,
  tableHeader,
  itemDetails,
  onSaveDocument,
  documentName,
}) => {
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [item, setItem] = useState({
    project_head: tableHeader,
    document: "",
    document_name: "",
    category: "",
    submission_date: "",
    status: "",
    reply_date: "",
  });
  const [documentView, setDocumentView] = useState("");
  const statusList = [
    { name: "Approved" },
    { name: "Submitted" },
    { name: "Not Submitted" },
    { name: "Not Approved" },
    { name: "Rejected" },
  ];

  const modalTitle =
    modalId.split("-")[0] === "add"
      ? `Add New Document`
      : modalId.split("-")[0] === "edit"
        ? `Edit ${tableHeader} Document`
        : modalId.split("-")[0] === "revision"
          ? `Revise ${tableHeader} Document`
          : "";

  const modalButtonText =
    modalId.split("-")[0] === "add"
      ? `Create Document`
      : modalId.split("-")[0] === "edit"
        ? `Save Document`
        : modalId.split("-")[0] === "revision"
          ? `Confirm`
          : "";

  useEffect(() => {
    if (itemDetails && itemDetails !== null) {
      setItem({
        ...itemDetails,
        revision_no: itemDetails.revision_no ?? "R0",
        is_active: itemDetails.is_active ?? true,
      });
    }
  }, [itemDetails]);

  const valueHandler = (e) => {
    setItem((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFile = async (e) => {
    const response = await handleFileUpload(e.target.files[0]);
    if (response.type === "success") {
      setItem({ ...item, document: response.data });
      setDocumentView(response.view);
    } else {
      toast.error(response.error || "Oops! Something went wrong");
    }
  };

  const onSubmit = () => {
    if (modalId.split("-")[0] === "revision" && !isRevisionMode) {
      setIsRevisionMode(true);
    } else {
      let keysToCheck = {
        document_name: "Document Name",
        category: "Category",
      };
      let formDetails = {
        document_name: item.document_name,
        category: item.category,
        is_active: true,
      };

      if (item.category !== "Void") {
        keysToCheck = {
          ...keysToCheck,
          document: "Document File",
          submission_date: "Submission Date",
          status: "Status",
        };
        formDetails = {
          ...formDetails,
          document: item.document,
          status: item.status,
          submission_date: item.submission_date,
          reply_date: item.reply_date,
        };
      }

      const validationResult = checkSpecificKeys(formDetails, keysToCheck);
      if (validationResult.isValid === false) {
        toast.error(validationResult.message);
        return;
      }

      onSaveDocument(formDetails, isRevisionMode);
      setDocumentView("");
    }
  };

  const onClose = () => {
    setItem({
      project_head: tableHeader,
      document: "",
      document_name: "",
      category: "",
      submission_date: "",
      status: "",
      reply_date: "",
    });
    setIsRevisionMode(false);
  };

  return (
    <FormModal
      id={modalId}
      onSubmit={onSubmit}
      ctaText={modalButtonText}
      heading={modalTitle}
      onClose={() =>
        ["add", "revise"].includes(modalId.split("-")[0]) ? onClose() : {}
      }
    >
      {modalId.split("-")[0] === "revision" && !isRevisionMode ? (
        <p className="text-sm">
          Are you sure you want to revise <strong>{documentName}</strong>&apos;s
          details? Please Confirm.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-2.5 gap-y-5">
          <Input
            type="text"
            label="Document Name"
            name="document_name"
            disabled={
              itemDetails?.document_name && itemDetails?.document_name !== ""
                ? true
                : false
            }
            mandatory={true}
            value={item.document_name}
            onChange={valueHandler}
          />

          <SelectForObjects
            margin={"0px"}
            height={"36px"}
            setselected={(value) =>
              setItem({
                ...item,
                category: value,
              })
            }
            mandatory={true}
            selected={item.category}
            options={[
              { name: "Approval" },
              { name: "Information" },
              { name: "Void" },
            ]}
            optionName={"name"}
            placeholder="Select Category"
            dropdownLabel={"Category"}
          />

          {item.category !== "Void" && (
            <>
              <span className="w-full flex gap-2 items-end">
                <Input
                  type="file"
                  onChange={handleFile}
                  mandatory={true}
                  label={"Upload Document"}
                />
                {/* {item.document && item.document !== "" && (
                  <FaEye
                    size={15}
                    className="cursor-pointer mb-3"
                    onClick={() => window.open(item.document, "__blank")}
                  />
                )} */}
                {documentView && documentView !== "" && (
                  <FaEye
                    size={15}
                    className="cursor-pointer mb-3"
                    onClick={() => window.open(documentView, "__blank")}
                  />
                )}
              </span>

              <Input
                type="date"
                label="Submission_date"
                name="submission_date"
                mandatory={true}
                value={item.submission_date}
                onChange={valueHandler}
              />

              <SelectForObjects
                margin={"0px"}
                height={"36px"}
                setselected={(value) =>
                  setItem({
                    ...item,
                    status: value,
                  })
                }
                mandatory={true}
                selected={item.status}
                options={statusList}
                optionName={"name"}
                placeholder="Select Status"
                dropdownLabel={"Status"}
              />

              <Input
                type="date"
                label="Reply Date"
                name="reply_date"
                value={item.reply_date}
                onChange={valueHandler}
              />
            </>
          )}
        </div>
      )}
    </FormModal>
  );
};

export default AddEditMDL;
