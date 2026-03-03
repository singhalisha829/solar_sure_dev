import FormModal from "../shared/FormModal";
import {
  SelectForObjects,
  MultiSelect,
} from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import DateRangePicker from "../shared/DateRangePicker";

const Filter = ({ setFilters, filterData, filterList, onSubmit }) => {
  return (
    <FormModal
      id={"apply-filter"}
      heading={"Filters"}
      ctaText={"Apply Filters"}
      onSubmit={onSubmit}
      className={"overflow-visible"}
    >
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-5">
        {filterList.length > 0 &&
          filterList.map((filter, filterIndex) => {
            if (
              filter.type === "dropdown" &&
              filter.dropdownType === "multi-select"
            ) {
              return (
                <MultiSelect
                  key={filterIndex}
                  options={filter.options}
                  optionName={filter.optionName}
                  height="36px"
                  optionID="id"
                  setselected={(entry) =>
                    setFilters({ ...filterData, [filter.key]: entry })
                  }
                  selected={filterData[filter.key]}
                  dropdownLabel={filter.name}
                  placeholder="Select.."
                  fontsize="0.75rem"
                  margin="0"
                  padding="0.35rem 1rem"
                />
              );
            } else if (filter.type === "dropdown") {
              const selectedOption = filter.optionId
                ? filter.options.find(
                    (option) =>
                      option[filter.optionId] == filterData[filter.key]
                  )?.[filter.optionName]
                : filterData[filter.key];
              return (
                <SelectForObjects
                  key={filterIndex}
                  margin={"0px"}
                  height={"36px"}
                  setselected={(name, id) => {
                    if (filter.optionId) {
                      setFilters({
                        ...filterData,
                        [filter.key]: id,
                      });
                    } else {
                      setFilters({
                        ...filterData,
                        [filter.key]: name,
                      });
                    }
                  }}
                  selected={selectedOption}
                  optionID={filter.optionId}
                  options={filter.options}
                  optionName={filter.optionName}
                  placeholder="Select.."
                  dropdownLabel={filter.name}
                />
              );
            }

            if (filter.type === "date") {
              return (
                <div
                  key={filterIndex}
                  className="flex flex-col gap-[10px] w-full"
                >
                  <label className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight">
                    {filter.name}
                  </label>
                  <DateRangePicker
                    startDate={filterData[filter.key]}
                    endDate={filterData[filter.key2]}
                    width={"w-full"}
                    handleDateChange={(startDate, endDate) => {
                      setFilters({
                        ...filterData,
                        [filter.key]: startDate,
                        [filter.key2]: endDate,
                      });
                    }}
                  />
                </div>
              );
            }
          })}
      </div>
    </FormModal>
  );
};

export default Filter;
