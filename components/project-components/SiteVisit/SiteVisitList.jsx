import CustomPagination from "@/components/shared/Pagination";
import Table from "@/components/SortableTable";

const SiteVisitList = ({
  eventList,
  onEventClick,
  companyAccessibility,
  pagination,
  totalCount,
  onPageChange
}) => {
  const tableHeader = [
    ...(companyAccessibility
      ? [
        {
          name: "Company Type",
          key: "is_ornate_project",
          type: "company_type",
          width: "10rem",
          sortable: true,
        },
      ]
      : []),
    {
      name: "Employee",
      key: "employe_name",
      width: "8rem",
      sortable: true,
    },
    {
      name: "Project",
      key: "project_name",
      width: "9rem",
      sortable: true,
    },
    {
      name: "Company",
      key: "company_name",
      width: "11rem",
      sortable: true,
    },
    {
      name: "Site Address",
      key: "complete_site_address",
      width: "15rem",
      sortable: true,
    },
    {
      name: "Start Date",
      key: "start_date",
      type: "date",
      width: "9rem",
      sortable: true,
    },
    {
      name: "End Date",
      key: "end_date",
      type: "date",
      width: "8rem",
      sortable: true,
    }, {
      name: "Total days at site",
      key: "no_of_days",
      // type: "date",
      width: "12rem",
      sortable: true,
    },
    { name: "Remark", key: "remark", sortable: true },
  ];

  return (
    <>
      <div className="overflow-auto h-[94%] mb-2">
        <Table
          rows={eventList}
          columns={tableHeader}
          onRowClick={onEventClick}
          prevPageRows={(pagination.page - 1) * pagination.limit}
          showSerialNumber={true}
        />
      </div>
      <div className="relative">
        <CustomPagination
          currentPage={pagination.page}
          totalRows={totalCount}
          rowsPerPage={pagination.limit}
          onPageChange={onPageChange}
        />
        <span className="absolute right-0 top-1">
          <strong>Total Count: </strong>
          {totalCount}
        </span>
      </div>
    </>
  );
};

export default SiteVisitList;
