import FormModal from "../../shared/FormModal";
import Table from "../../SortableTable";

const ProjectInstallerHistory = ({ details }) => {
  const tableHeader = [
    {
      name: "Installer Name",
      sortable: true,
      key: "installer_name",
      width: "11rem",
    },
    {
      name: "Start Date",
      sortable: true,
      key: "start_date",
      type: "date",
      width: "9rem",
    },
    {
      name: "End Date",
      sortable: true,
      key: "end_date",
      type: "date",
      width: "8rem",
    },
    {
      name: "Remark",
      sortable: true,
      key: "remark",
    },
  ];

  return (
    <FormModal
      id={"project-installer-history"}
      heading={"Project Installers"}
      cancelButtonText={"Close"}
    >
      <div className="overflow-auto mb-2">
        <Table columns={tableHeader} rows={details} showSerialNumber={true} />
      </div>
    </FormModal>
  );
};

export default ProjectInstallerHistory;
