import { SelectForObjects } from "@/components/formPage/MultiSelectDropdown/MultiSelectDropdown";
import Button from "@/components/shared/Button";
import DateRangePicker from "@/components/shared/DateRangePicker";
import Loading from "@/components/shared/Loading";
import { useStateCity } from "@/contexts/state_city";
import { requestHandler } from "@/services/ApiHandler";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { getCompanies, getDashBoardInfo } from "@/services/api";
import { extractParts, formatPrice } from "@/utils/numberHandler";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
});

function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardInfo, setIsDashboardInfo] = useState(null);
  const [companies, setCompanies] = useState([]);
  const { states } = useStateCity();
  const [filters, setFilters] = useState({
    status: "",
    state_name: "",
    state: "",
    customer: "",
    customer_name: "",
    company_type: "",
    stage: "",
    project_type: "",
    project_start_date: null,
    project_end_date: null,
    project_closing_start_date: null,
    project_closing_end_date: null,
  });
  const user = LocalStorageService.get("user");
  const token = LocalStorageService.get("access_token");
  const companyAccessibility =
    LocalStorageService.get("user_accessibility")?.accessibility[0]
      ?.company_access?.both_company ?? false;

  const companyTypeList = [
    { name: "Ornate", value: "ornate" },
    { name: "SG Ornate", value: "sg" },
  ];

  const stageList = [
    { name: "Created" },
    { name: "Engineering" },
    { name: "Planning" },
    { name: "Procurement" },
    { name: "Packing List" },
    { name: "Closed" },
  ];

  const projectTypeList = [
    { name: "Inroof" },
    { name: "Skin Roof" },
    { name: "Conventional" },
    { name: "Ground mounted-Ornate" },
    { name: "Tracker(GM-SG)" },
    { name: "BESS" },
  ];

  useEffect(() => {
    const user = LocalStorageService.get("user");
    const token = LocalStorageService.get("access_token");
    if (!user || !token) {
      router.push("/login");
    }
  }, []);

  const getDashBoardInfoHandler = async (filters) => {
    await requestHandler(
      () => getDashBoardInfo(filters),
      setIsLoading,
      (data) => {
        setIsDashboardInfo(data.data.output[0]);
      },
      toast.error
    );
  };

  const getCompaniesHandler = async () => {
    await requestHandler(
      async () => await getCompanies(),
      null,
      (data) => setCompanies(data.data.output),
      toast.error
    );
  };

  useEffect(() => {
    getDashBoardInfoHandler(filters);
    getCompaniesHandler();
  }, []);

  const data = [
    {
      name: "Total Projects",
      value: dashboardInfo?.project_count,
    },
    {
      name: "Total Value",
      value: dashboardInfo?.total_budget,
    },
    {
      name: "Total Capacity",
      value: dashboardInfo?.total_project_capacity,
    },
    {
      name: "In-Progress",
      value: dashboardInfo?.total_in_progress,
    },
    {
      name: "On-Hold",
      value: dashboardInfo?.total_on_hold,
    },
    {
      name: "Completed",
      value: dashboardInfo?.total_completed,
    },
  ];

  const applyFilters = async () => {
    await getDashBoardInfoHandler(filters);
  };

  if (!user || !token) return null;
  if (isLoading) return <Loading />;
  if (!dashboardInfo)
    return (
      <div className="m-auto">
        <h1 className="text-red-500 font-medium">
          Something Went Wrong. Please Try Again later.
        </h1>
      </div>
    );

  return (
    <>
      <div className="flex flex-col gap-2  grow">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((item, index) => {
            const { number, unit } = extractParts(item.value);

            return (
              <div
                className="flex items-center  bg-white p-4 gap-3 rounded-2xl"
                key={index}
              >
                <div className="bg-orange-100 rounded-full w-[60px] h-[60px]" />
                <div className="">
                  <p className="text-slate-950 text-3xl font-extrabold">
                    {formatPrice(number)} {unit}
                  </p>
                  <p className="text-slate-950 text-base font-medium">
                    {item.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col lg:flex-row gap-4 bg-white grow rounded-2xl">
          <div className="p-4 flex flex-col gap-5">
            <h3 className="text-black text-lg font-bold leading-3 tracking-tight">
              Filter Map View
            </h3>
            <div className="flex flex-col gap-[10px]">
              {companyAccessibility && (
                <SelectForObjects
                  disableBorderLeft={true}
                  height="30px"
                  margin="0"
                  dropdownLabel={"Filter By Company Type"}
                  optionName="name"
                  options={companyTypeList}
                  placeholder="Select Company Type"
                  optionID="value"
                  disabled={false}
                  setselected={(name, value) =>
                    setFilters((prev) => ({
                      ...prev,
                      company_type: value,
                    }))
                  }
                  selected={
                    companyTypeList.filter(
                      (type) => type.value === filters.company_type
                    )[0]?.name
                  }
                />
              )}
              <SelectForObjects
                disableBorderLeft={true}
                height="30px"
                margin="0"
                dropdownLabel={"Filter By Status"}
                optionName="name"
                options={[
                  { name: "Active" },
                  { name: "Hold" },
                  { name: "Closed" },
                ]}
                placeholder="Select Status"
                optionID="id"
                disabled={false}
                setselected={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: value,
                  }))
                }
                selected={filters.status}
              />
              <SelectForObjects
                disableBorderLeft={true}
                height="30px"
                margin="0"
                dropdownLabel={"Filter By Customer"}
                optionName="name"
                options={companies}
                placeholder="Select Customer"
                optionID="id"
                disabled={false}
                setselected={(value, id) =>
                  setFilters((prev) => ({
                    ...prev,
                    customer: id,
                    customer_name: value,
                  }))
                }
                selected={filters.customer_name}
              />
              <SelectForObjects
                disableBorderLeft={true}
                height="30px"
                margin="0"
                dropdownLabel={"Filter By State"}
                optionName="name"
                options={states}
                placeholder="Select State"
                optionID="id"
                disabled={false}
                setselected={(value, id) =>
                  setFilters((prev) => ({
                    ...prev,
                    state: id,
                    state_name: value,
                  }))
                }
                selected={filters.state_name}
              />

              <SelectForObjects
                disableBorderLeft={true}
                height="30px"
                margin="0"
                dropdownLabel={"Filter By Stage"}
                optionName="name"
                options={stageList}
                placeholder="Select Stage"
                disabled={false}
                setselected={(value, id) =>
                  setFilters((prev) => ({
                    ...prev,
                    stage: value,
                  }))
                }
                selected={filters.stage}
              />

              <SelectForObjects
                disableBorderLeft={true}
                height="30px"
                margin="0"
                dropdownLabel={"Filter By Project Type"}
                optionName="name"
                options={projectTypeList}
                placeholder="Select Type"
                disabled={false}
                setselected={(value, id) =>
                  setFilters((prev) => ({
                    ...prev,
                    project_type: value,
                  }))
                }
                selected={filters.project_type}
              />
            </div>
            <div
              className="flex flex-col gap-[10px] w-full"
            >
              <label className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight">
                Filter by Project Start Date
              </label>
              <DateRangePicker
                startDate={filters.project_start_date}
                endDate={filters.project_end_date}
                width={"w-full"}
                handleDateChange={(startDate, endDate) => {
                  setFilters((prev) => ({
                    ...prev,
                    project_start_date: startDate,
                    project_end_date: endDate,
                  }));
                }}
              />
            </div>
            <div
              className="flex flex-col gap-[10px] w-full"
            >
              <label className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight">
                Filter by Project Closing Date
              </label>
              <DateRangePicker
                startDate={filters.project_closing_start_date}
                endDate={filters.project_closing_end_date}
                width={"w-full"}
                handleDateChange={(startDate, endDate) => {
                  setFilters((prev) => ({
                    ...prev,
                    project_closing_start_date: startDate,
                    project_closing_end_date: endDate,
                  }));
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={"inverted"}
                customText={"text-primary"}
                onClick={() => {
                  setFilters({
                    status: "",
                    state_name: "",
                    state: "",
                    customer: "",
                    customer_name: "",
                    stage: "",
                  });
                  getDashBoardInfoHandler({
                    status: "",
                    state_name: "",
                    state: "",
                    customer: "",
                    customer_name: "",
                    stage: "",
                  });
                }}
              >
                Clear
              </Button>
              <Button onClick={applyFilters}>Apply</Button>
            </div>
          </div>
          <div className="relative grow min-h-[600px]">
            {dashboardInfo && (
              <MapComponent projects={dashboardInfo.projects} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
export default Home;
