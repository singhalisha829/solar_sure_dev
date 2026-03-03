import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { MdOutlineClose } from "react-icons/md";

const DateRangePicker = (props) => {
  const [dateRange, setDateRange] = useState([]);
  const currentYear = dayjs().year();

  useEffect(() => {
    if (props.startDate != null && props.endDate != null) {
      setDateRange([
        props.startDate ? dayjs(props.startDate) : undefined,
        props.endDate ? dayjs(props.endDate) : undefined,
      ]);
    }
  }, [props.startDate, props.endDate]);

  const handleDateRangeChange = (value) => {
    setDateRange(value);
    props.handleDateChange(value[0]["$d"], value[1]["$d"]);
  };

  const handleYearChange = (date, dateString) => {
    props.handleYearChange(date, dateString);
  };

  const disabledDate = (current) => {
    // Disable dates before the start of the past month
    if (props.minDate) {
      return current && current < dayjs(props.minDate);
    }
  };

  const rangePresets = [
    {
      label: "Last 7 Days",
      value: [dayjs().add(-7, "d"), dayjs()],
    },
    {
      label: "Last 30 Days",
      value: [dayjs().add(-30, "d"), dayjs()],
    },
    {
      label: "This Month",
      value: [dayjs().startOf("month"), dayjs().endOf("month")],
    },
    {
      label: "Last Month",
      value: [
        dayjs().subtract(1, "month").startOf("month"),
        dayjs().subtract(1, "month").endOf("month"),
      ],
    },
    {
      label: "Last 3 Months",
      value: [
        dayjs().subtract(3, "month").startOf("month"),
        dayjs().endOf("month"),
      ],
    },
    {
      label: "Last 6 Months",
      value: [
        dayjs().subtract(6, "month").startOf("month"),
        dayjs().endOf("month"),
      ],
    },
    {
      label: "Last 1 Year",
      value: [
        dayjs().subtract(12, "month").startOf("month"),
        dayjs().endOf("month"),
      ],
    },
    {
      label: "This Financial Year",
      value: [
        dayjs(`${currentYear}-04-01`).startOf("day"),
        dayjs(`${currentYear + 1}-03-31`).endOf("day"),
      ],
    },
    {
      label: "Last Financial Year",
      value: [
        dayjs(`${currentYear - 1}-04-01`).startOf("day"),
        dayjs(`${currentYear}-03-31`).endOf("day"),
      ],
    },
  ];

  if (["year", "month"].includes(props.picker)) {
    return (
      <div className={`flex h-[2rem] ${props.className}`}>
        <DatePicker
          className={`${props.width ? props.width : "w-[8rem]"} border-1 active:border-1 border-[#e0e0e0]`}
          onChange={handleYearChange}
          defaultValue={dayjs(props.value)}
          picker={props.picker}
          allowClear={false}
        />
      </div>
    );
  } else {
    return (
      <div className={`flex h-[2.1rem] relative ${props.className}`}>
        <MdOutlineClose
          className="absolute text-gray-400 z-[5] cursor-pointer right-8 top-[0.6rem]"
          onClick={() => {
            setDateRange([null, null]);
            props.handleDateChange(null, null);
          }}
        />
        <DatePicker.RangePicker
          className={`${props.width ? props.width : "w-[15rem]"} border-1 active:border-1 border-[#e0e0e0]`}
          allowClear={false}
          value={dateRange}
          onChange={handleDateRangeChange}
          presets={rangePresets}
          size="small"
          format="DD/MM/YYYY"
          disabledDate={disabledDate}
        />
      </div>
    );
  }
};

export default DateRangePicker;
