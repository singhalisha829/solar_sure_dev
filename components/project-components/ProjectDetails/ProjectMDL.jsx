import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Button from "../../shared/Button";
import dynamic from "next/dynamic";
import Table from "../../SortableTable";
import { FiPlusCircle } from "react-icons/fi";
import { useProject } from "@/contexts/project";
import {
  getMasterDrawingList,
  updateMasterDrawingList,
  reviseMasterDrawing,
  getMasterDrawingRevisionHistory,
} from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { useModal } from "@/contexts/modal";

const EditMDLModal = dynamic(
  () => import("../../modals/ProjectDetails/AddEditMDL")
);
const DeleteWarningModal = dynamic(() => import("../../modals/WarningModal"));
const AddEditMDL = dynamic(
  () => import("../../modals/ProjectDetails/AddEditMDL")
);
const RevisionHistoryModal = dynamic(
  () => import("../../modals/ProjectDetails/MDLRevisionHistoryModal")
);

const ProjectMDL = ({ userInfo, projectHeadsId }) => {
  const router = useRouter();
  const { projectId } = router.query;
  const { openModal, closeModal } = useModal();
  const { projectDetails, refetchProjectDetails } = useProject();
  const [selectedMdl, setSelectedMdl] = useState(null);
  const [drawingList, setDrawingList] = useState({});
  const [currentModalId, setCurrentModalId] = useState("");
  const [revisionList, setRevisionList] = useState([]);

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility").accessibility[0].projects
      .engineering_tab ?? {};

  const allowedActions =
    (accessibilityInfo?.mdl_edit_view ? "edit-mdl_revision-" : "") +
    (accessibilityInfo?.mdl_delete_view ? "delete-" : "");

  useEffect(() => {
    if (projectDetails) {
      fetchDrawingList();
    }
  }, [projectDetails]);

  const drawingListTableColumn = [
    {
      name: "Documents",
      key: "document_name",
      type: "text",
      width: "180px",
    },
    {
      name: "Category",
      key: "category",
      type: "dropdown",
      width: "120px",
      options: [
        { name: "Approval" },
        { name: "Information" },
        { name: "Void" },
      ],
      optionId: "name",
      optionName: "name",
    },
    { name: "Document", type: "file", key: "document", width: "100px" },
    {
      name: "Submission Date",
      type: "date",
      key: "submission_date",
      width: "100px",
    },
    {
      name: "Final Revision",
      type: "custom-view",
      key: "revision_no",
      width: "80px",
    },
    { name: "Status", type: "text", key: "status", width: "120px" },
    { name: "Reply Date", type: "date", key: "reply_date" },

    // Conditionally add the "Actions" column
    ...(accessibilityInfo?.mdl_edit_view || accessibilityInfo?.mdl_delete_view
      ? [
        {
          name: "Actions",
          type: "actions-column",
          actionType: allowedActions,
          width: "5rem",
          onClickEdit: (row) => {
            setSelectedMdl(row);
            setCurrentModalId("edit-mdl-modal");
            openModal("edit-mdl-modal");
          },
          onClickDelete: (row) => {
            setSelectedMdl(row);
            openModal("delete-warning-modal");
          },
          onClickRevsion: (row) => {
            setSelectedMdl(row);
            setCurrentModalId("revision-warning-modal");
            openModal("revision-warning-modal");
          },
        },
      ]
      : []),
  ];

  const fetchRevisionList = async (mdlCategory, documentName) => {
    await requestHandler(
      async () =>
        await getMasterDrawingRevisionHistory(
          projectId,
          mdlCategory,
          documentName
        ),
      null,
      async (data) => {
        setRevisionList(data.status.data);
        openModal("mdl-revision-history-modal");
      },
      toast.error
    );
  };

  const fetchDrawingList = async () => {
    // if mdl data exists for both eletrical and mechanical section
    if (projectDetails?.mdl && Object.keys(projectDetails.mdl).length === 2) {
      let mdlDetails = {};
      // filter out inactive drawings
      for (let key in projectDetails.mdl) {
        mdlDetails[key] = projectDetails.mdl[key].filter(
          (drawing) => drawing.is_active === true
        );
        mdlDetails[key].map((mdl) => {
          mdl.mdl_category = key;
        });
      }
      setDrawingList(mdlDetails);
    }
    // if mdl data exists for only one section
    else if (
      projectDetails?.mdl &&
      Object.keys(projectDetails.mdl).length === 1
    ) {
      await requestHandler(
        async () => await getMasterDrawingList(),
        null,
        async (data) => {
          const existingCategoryKey = Object.keys(projectDetails.mdl)[0];
          let mdlDetails = {};

          for (let key in data.data.output) {
            if (key === existingCategoryKey) {
              // filter out inactive drawings
              mdlDetails[existingCategoryKey] = projectDetails.mdl[
                existingCategoryKey
              ].filter((drawing) => drawing.is_active === true);
              mdlDetails[existingCategoryKey].map((mdl) => {
                mdl.mdl_category = existingCategoryKey;
              });
            } else {
              mdlDetails[key] = data.data.output[key];
              mdlDetails[key].map((mdl) => {
                mdl.is_active = true;
                mdl.mdl_category = key;
              });
            }
            setDrawingList(mdlDetails);
          }
        },
        toast.error
      );
    }
    // if mdl data doesnt exists for any sections
    else {
      await requestHandler(
        async () => await getMasterDrawingList(),
        null,
        async (data) => {
          let mdlDetails = data.data.output;
          mdlDetails.Electrical.map((mdl) => {
            mdl.is_active = true;
            mdl.mdl_category = "Electrical";
          });
          mdlDetails.Mechanical.map((mdl) => {
            mdl.is_active = true;
            mdl.mdl_category = "Mechanical";
          });
          setDrawingList(data.data.output);
        },
        toast.error
      );
    }
  };

  const handleDocumentDetails = (data, isRevisionMode, mdlCategory) => {
    if (isRevisionMode) {
      let formDetails = {
        category: data.category,
        document: data.document,
        submission_date: data.submission_date,
        reply_date: data.reply_date,
        status: data.status,
        revision_no: "R" + (Number(data.revision_no.split("")[1]) + 1),
      };
      reviseMDLDetails(data.document_name, formDetails, mdlCategory);
    } else {
      let formDetails = drawingList[mdlCategory];
      const index = formDetails.findIndex(
        (item) => item.document_name == data.document_name
      );
      if (index !== -1) {
        formDetails = formDetails.map((item) => ({
          ...item,
          document: item.document_url ? item.document_url : item.document,
        }));

        formDetails[index] = { ...data, revision_no: "R0" };
        saveMDLDetails(formDetails, mdlCategory);
      }
    }
  };

  const removeDocument = (data) => {
    let formDetails = drawingList[data.mdl_category];
    const index = formDetails.findIndex(
      (item) => item.document_name == data.document_name
    );
    if (index !== -1) {
      formDetails[index]["is_active"] = false;
      saveMDLDetails(formDetails, data.mdl_category);
      closeModal("delete-warning-modal");
    }
  };

  const handleAddMDL = async (data, mdlCategory) => {
    let formDetails = drawingList[mdlCategory];
    formDetails.push({ ...data, revision_no: "R0" });
    await saveMDLDetails(formDetails, mdlCategory);
    closeModal("add-" + mdlCategory + "-document");
  };

  const saveMDLDetails = async (formDetails, mdlCategory) => {
    await requestHandler(
      async () =>
        await updateMasterDrawingList(projectId, {
          [mdlCategory]: formDetails,
        }),
      null,
      async (data) => {
        toast.success("MDL Saved Successfully...");
        // closeModal(currentModalId);
        refetchProjectDetails();
      },
      toast.error
    );
  };

  const reviseMDLDetails = async (documentName, formDetails, mdlCategory) => {
    await requestHandler(
      async () =>
        await reviseMasterDrawing(
          projectId,
          mdlCategory,
          documentName,
          formDetails
        ),
      null,
      async (data) => {
        toast.success("MDL Saved Successfully");
        refetchProjectDetails();
      },
      toast.error
    );
  };
  // console.log(drawingList["Electrical"]);
  return (
    <>
      {Object.keys(drawingList).length !== 0 &&
        Object.keys(drawingList).map((mdlCategory) => (
          <div key={mdlCategory} className="space-y-4">
            <span className="flex justify-between">
              <h4 className="text-zinc-800 text-xl font-bold tracking-tight">
                {mdlCategory}
              </h4>
              {accessibilityInfo?.mdl_add_view && (
                <Button
                  onClick={() => openModal("add-" + mdlCategory + "-document")}
                  variant={"inverted"}
                  customText={"#F47920"}
                  className="border-1 border-dark-bluish-green text-dark-bluish-green px-2 bg-white hover:bg-slate-100 "
                >
                  <FiPlusCircle size={15} />
                  Add Document
                </Button>
              )}
              <AddEditMDL
                modalId={"add-" + mdlCategory + "-document"}
                onSaveDocument={(data) => handleAddMDL(data, mdlCategory)}
              />
            </span>
            <div className="overflow-y-auto">
              <Table
                rows={drawingList[mdlCategory]}
                columns={drawingListTableColumn}
                handleOpenHistoryModal={(row) => {
                  setSelectedMdl(row);
                  fetchRevisionList(mdlCategory, row?.document_name);
                }}
              />
            </div>
          </div>
        ))}
      <EditMDLModal
        modalId={currentModalId}
        tableHeader={selectedMdl?.mdl_category}
        itemDetails={selectedMdl}
        documentName={selectedMdl?.document_name}
        onSaveDocument={(data, isRevisionMode) => {
          handleDocumentDetails(
            { ...data, revision_no: selectedMdl?.revision_no },
            isRevisionMode,
            selectedMdl?.mdl_category
          );
        }}
      />

      <DeleteWarningModal
        modalId={"delete-warning-modal"}
        modalContent={
          <>
            Are you sure you want to delete{" "}
            <strong>{selectedMdl?.document_name}</strong>&apos; details? This
            action is irreversible.
          </>
        }
        onSubmit={() => removeDocument(selectedMdl)}
      />

      <RevisionHistoryModal
        modalId={"mdl-revision-history-modal"}
        documentName={selectedMdl?.document_name}
        revisionList={revisionList}
      />
    </>
  );
};

export default ProjectMDL;
