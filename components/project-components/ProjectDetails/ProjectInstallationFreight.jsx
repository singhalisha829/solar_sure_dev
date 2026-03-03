import EditableTable from "../EditableTable";
import { useState } from "react";
import { useRouter } from "next/router";
import Button from "../../shared/Button";
import { FaPlusCircle } from "react-icons/fa";
import { useModal } from "@/contexts/modal";
import dynamic from "next/dynamic";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { addCommasToNumber } from "@/utils/numberHandler";
import { deleteProjectInstallationItem } from "@/services/api";
import { toast } from "sonner";
import { requestHandler } from "@/services/ApiHandler";

const AddInstalltionItem = dynamic(
  () => import("@/components/modals/ProjectDetails/AddEditInstallationItems")
);

const DeleteWarningModal = dynamic(
  () => import("@/components/modals/WarningModal")
);

const ProjectInstallationFreight = ({
  activeSubTab,
  showAddButton,
  totalItems,
  isContingency,
  onSuccessfullSubmit,
  projectCapacity,
  tab,
  isPlanningApproved,
}) => {
  const router = useRouter();
  const { projectId } = router.query;
  const { openModal, closeModal } = useModal();
  const [selectedRow, setSelectedRow] = useState({});

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility")?.accessibility[0].projects
      .engineering_tab ?? {};

  const frieghtItems = totalItems.filter(
    (item) => item.budget_type === "Freight"
  );
  const installationItems = totalItems.filter(
    (item) => item.budget_type === "Installation"
  );
  const otherItems = totalItems.filter((item) => item.budget_type === "Other");

  let totalFreightBbuAmount = 0;
  frieghtItems.map((item) => {
    totalFreightBbuAmount += Number(item.amount || 0);
    item.perWatt = Number(item.amount || 0) / (projectCapacity * 1000);
  });
  const freightPerWatt =
    totalFreightBbuAmount / ((projectCapacity || 1) * 1000);

  let totalInstallationBbuAmount = 0;
  installationItems.map((item) => {
    totalInstallationBbuAmount += Number(item.amount || 0);
    item.perWatt = Number(item.amount || 0) / (projectCapacity * 1000);
  });
  const installationPerWatt =
    totalInstallationBbuAmount / ((projectCapacity || 1) * 1000);

  let totalOtherBbuAmount = 0;
  otherItems.map((item) => {
    totalOtherBbuAmount += Number(item.amount || 0);
    item.perWatt = Number(item.amount || 0) / (projectCapacity * 1000);
  });
  const otherPerWatt = totalOtherBbuAmount / ((projectCapacity || 1) * 1000);

  const tableHeader = [
    {
      name: "Name",
      key: "name",
      minWidth: "30%",
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
      minWidth: "10%",
    },
    {
      name: "Description",
      key: "description",
      minWidth: "40%",
    },
    {
      name: "Created By",
      key: "created_by",
      minWidth: "15%",
    },
  ];

  const handleDeleteRow = (index) => {
    const data =
      activeSubTab === "Installation"
        ? installationItems
        : activeSubTab === "Freight"
          ? frieghtItems
          : otherItems;

    const selectedItem = data[index];
    setSelectedRow(selectedItem);
    openModal("delete-warning-modal");
  };

  const removeDocument = async (id) => {
    await requestHandler(
      async () => await deleteProjectInstallationItem(id),
      null,
      (data) => {
        closeModal("delete-warning-modal");
        onSuccessfullSubmit();
        toast.success(
          `${activeSubTab} Item - ${selectedRow?.name} deleted Successfully!`
        );
      },
      toast.error
    );
  };

  return (
    <>
      {showAddButton && accessibilityInfo?.add_view && (
        <Button
          onClick={() => openModal("add-installation-item")}
          variant={"inverted"}
          customText={"#F47920"}
          className="bg-orange-400/10 w-[7rem] self-end text-primary px-2 hover:bg-orange-600/10 "
        >
          <FaPlusCircle />
          Add Item
        </Button>
      )}

      {tab === "Planning" && (
        <p className="text-zinc-800 text-base font-bold tracking-tight">
          BBU Amount: ₹
          {addCommasToNumber(
            activeSubTab === "Installation"
              ? totalInstallationBbuAmount
              : activeSubTab === "Freight"
                ? totalFreightBbuAmount
                : totalOtherBbuAmount
          )}
          ; Per Watt: ₹
          {addCommasToNumber(
            activeSubTab === "Installation"
              ? installationPerWatt
              : activeSubTab === "Freight"
                ? freightPerWatt
                : otherPerWatt
          )}
        </p>
      )}
      <EditableTable
        rows={
          activeSubTab === "Installation"
            ? installationItems
            : activeSubTab === "Freight"
              ? frieghtItems
              : otherItems
        }
        columns={tableHeader}
        isEditMode={showAddButton && accessibilityInfo?.edit_view}
        isModalOpenOnEdit={"edit-installation-item"}
        onEditSuccess={onSuccessfullSubmit}
        highlightContigencyRows={true}
        tableHeader={activeSubTab}
        {...(showAddButton && accessibilityInfo?.edit_view
          ? { onDeleteRow: handleDeleteRow }
          : {})}
      />
      <AddInstalltionItem
        modalId={"add-installation-item"}
        projectId={projectId}
        onSuccessfullSubmit={onSuccessfullSubmit}
        isContingency={isContingency}
        activeSubTab={activeSubTab}
        isPlanningApproved={isPlanningApproved}
      />
      <DeleteWarningModal
        modalId={"delete-warning-modal"}
        modalContent={
          <>
            Are you sure you want to delete <strong>{activeSubTab}</strong> item
            - <strong>{selectedRow?.name}</strong>? This action is irreversible.
          </>
        }
        onSubmit={() => removeDocument(selectedRow?.id)}
      />
    </>
  );
};

export default ProjectInstallationFreight;
