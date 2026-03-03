import { useState, useEffect } from "react";
import { getSiteVisitList } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import Loading from "@/components/Loading";
import { useModal } from "@/contexts/modal";
import dynamic from "next/dynamic";
import Button from "@/components/shared/Button";
import { FiPlusCircle } from "react-icons/fi";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { SelectForObjects } from "@/components/formPage/MultiSelectDropdown/MultiSelectDropdown";
import { useRouter } from "next/router";
import { dateFormatInYYYYMMDD } from "@/utils/formatter";
import Search from "@/components/shared/SearchComponent";
import { usePagination } from "@/hooks/usePagination";

const SiteVisitList = dynamic(
  () => import("@/components/project-components/SiteVisit/SiteVisitList")
);
const SiteVisitScheduler = dynamic(
  () => import("@/components/project-components/SiteVisit/SiteVisitScheduler")
);
const EditSiteVisit = dynamic(
  () => import("@/components/modals/EditSiteVisit")
);

const SiteVisits = () => {
  const router = useRouter();
  const { openModal } = useModal();
  const [selectedView, setSelectedView] = useState("calendar");
  const [isLoading, setIsLoading] = useState(true);
  // Separate state for calendar (all data) and list (paginated data)
  const [calendarSiteVisits, setCalendarSiteVisits] = useState([]);
  const [listSiteVisits, setListSiteVisits] = useState([]);
  const [totalSiteVisitsCount, setTotalSiteVisitsCount] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    company_type: "",
  });

  // Pagination hook for list view only
  const { pagination, resetToPageOne, handlePageChange } = usePagination({
    defaultPage: 1,
    defaultLimit: 25
  });

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility").accessibility[0].site_visit ??
    {};

  const companyAccessibility =
    LocalStorageService.get("user_accessibility")?.accessibility[0]
      ?.company_access.both_company ?? false;

  const companyTypeList = [
    { name: "Ornate", value: "ornate" },
    { name: "SG Ornate", value: "sg" },
  ];

  useEffect(() => {
    // Fetch all data for calendar view on mount
    fetchAllSiteVisits();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      // Fetch appropriate data based on current view
      if (selectedView === "calendar") {
        fetchAllSiteVisits(filters);
      } else {
        fetchPaginatedSiteVisits(filters, pagination.page, pagination.limit);
      }
    }, 400); // debounce delay

    return () => clearTimeout(delay);
  }, [filters.search, selectedView, pagination.page, pagination.limit]);

  // Fetch ALL site visits (for calendar view) - no pagination
  const fetchAllSiteVisits = async (filters = {}) => {
    await requestHandler(
      async () => await getSiteVisitList(filters),
      setIsLoading,
      (data) => {
        let events = [];
        data.data.output.map((event) => {
          const title = `${event.employe_name} - ${event.company_name} (${event.site_address},${event.site_address_city},${event.site_address_state},${event.site_address_pincode})`;
          const start = new Date(event.start_date);
          const end = new Date(event.end_date);
          const complete_site_address = `${event.site_address},${event.site_address_city},${event.site_address_state},${event.site_address_pincode}`;

          events.push({ title, ...event, start, end, complete_site_address });
        });
        setCalendarSiteVisits(events);
      },
      toast.error
    );
  };

  // Fetch PAGINATED site visits (for list view) - with page and limit
  const fetchPaginatedSiteVisits = async (filters = {}, page = 1, limit = 25) => {
    const paginatedFilters = {
      ...filters,
      page,
      limit,
    };

    await requestHandler(
      async () => await getSiteVisitList(paginatedFilters),
      setIsLoading,
      (data) => {
        let events = [];
        data.data.output.map((event) => {
          const title = `${event.employe_name} - ${event.company_name} (${event.site_address},${event.site_address_city},${event.site_address_state},${event.site_address_pincode})`;
          const start = new Date(event.start_date);
          const end = new Date(event.end_date);
          const complete_site_address = `${event.site_address},${event.site_address_city},${event.site_address_state},${event.site_address_pincode}`;

          events.push({ title, ...event, start, end, complete_site_address });
        });
        setListSiteVisits(events);
        setTotalSiteVisitsCount(data.data.length);
      },
      toast.error
    );
  };

  const onSelectSlot = ({ start, end }) => {
    router.push(
      `site-visits/add-site-visit/?date=${dateFormatInYYYYMMDD(start)}`
    );
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-5">
          <h2 className="text-orange-500 text-xl font-bold tracking-tight">
            Site Visits
          </h2>
          <div className="overflow-hidden rounded-md border-1">
            <button
              className={` py-1 px-2 ${selectedView == "calendar" ? "bg-primary text-white " : ""
                }`}
              onClick={() => {
                setSelectedView("calendar");
                const { page, limit, ...otherQuery } = router.query;
                router.push(
                  {
                    pathname: router.pathname,
                    query: otherQuery,
                  },
                  undefined,
                  { shallow: true }
                );
              }}
            >
              Calendar View
            </button>

            <button
              className={` py-1 px-2 ${selectedView == "list" ? "bg-primary text-white " : ""
                }`}
              onClick={() => {
                setSelectedView("list");
                resetToPageOne(true);
              }}
            >
              List View
            </button>
          </div>
        </div>


        <div className="flex gap-4 justify-end">
          {selectedView === "list" && accessibilityInfo?.add_site && (
            <Button
              className="px-3 w-[8rem]"
              onClick={() => router.push(`site-visits/add-site-visit/`)}
            >
              <FiPlusCircle size={15} />
              Create New
            </Button>
          )}

          <div className="flex items-center gap-4">
            {
              selectedView === "list" &&
              <Search
                searchText={(data) => {
                  setSearch(data);
                  setFilters((prev) => ({
                    ...prev,
                    search: data,
                  }));
                }}
                searchPlaceholder="Search name or site"
                value={search}
              />
            }
          </div>

          {companyAccessibility && (
            <SelectForObjects
              height="34px"
              margin="0"
              className={"w-[13rem]"}
              optionName="name"
              options={companyTypeList}
              placeholder="Select Company Type"
              optionID="value"
              disabled={false}
              setselected={(name, value) => {
                setFilters((prev) => ({
                  ...prev,
                  company_type: value,
                }));
                // Fetch appropriate data based on current view
                if (selectedView === "calendar") {
                  fetchAllSiteVisits({ ...filters, company_type: value });
                } else {
                  resetToPageOne();
                  fetchPaginatedSiteVisits({ ...filters, company_type: value }, 1, pagination.limit);
                }
              }}
              selected={
                companyTypeList.filter(
                  (type) => type.value === filters.company_type
                )[0]?.name
              }
            />
          )}
        </div>
      </div>
      <div className="min-h-[85vh] overflow-hidden bg-white p-5">
        {!isLoading && selectedView === "calendar" && (
          <SiteVisitScheduler
            eventList={calendarSiteVisits}
            handleLeaveManagementForm={(start, end) => onSelectSlot(start, end)}
            handleSelectEvent={(e) => {
              openModal("edit-site-visit");
              setSelectedEvent(e);
            }}
            canCreateSiteVisit={accessibilityInfo?.add_site}
          />
        )}
        {!isLoading && selectedView === "list" && (
          <SiteVisitList
            eventList={listSiteVisits}
            onEventClick={(data) => {
              openModal("edit-site-visit");
              setSelectedEvent(data);
            }}
            companyAccessibility={companyAccessibility}
            pagination={pagination}
            totalCount={totalSiteVisitsCount}
            onPageChange={handlePageChange}
          />
        )}
        {isLoading && <Loading />}
      </div>
      {selectedEvent && (
        <EditSiteVisit
          modalId={"edit-site-visit"}
          selectedEvent={selectedEvent}
          onSuccessfullSubmit={() => {
            // Refresh appropriate data based on current view
            if (selectedView === "calendar") {
              fetchAllSiteVisits(filters);
            } else {
              fetchPaginatedSiteVisits(filters, pagination.page, pagination.limit);
            }
          }}
          canEditSiteVisit={accessibilityInfo?.edit_site}
        />
      )}
    </>
  );
};

export default SiteVisits;
