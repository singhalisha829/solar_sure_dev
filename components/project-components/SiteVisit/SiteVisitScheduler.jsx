import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";

const localizer = momentLocalizer(moment);

const SiteVisitScheduler = (props) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const customViews = {
    month: true, // Enable the month view
    week: true, // Enable the week view
    day: false, // Disable the day view
  };

  // const eventPropGetter = (event) => {
  //   if (props.leaveTypeList.length > 0) {
  //     let color = props.leaveTypeList?.filter(
  //       (element) => element.name == event.leave_type
  //     )?.[0]["color_code"];

  //     return {
  //       style: {
  //         backgroundColor: color ? "#" + color : "gray",
  //       },
  //     };
  //   }
  // };

  const dayPropGetter = (date) => {
    if (moment(date).isSame(moment(), "day")) {
      return {
        className: "today-cell", // Add a CSS class for styling
        style: {
          backgroundColor: "#ffe9d9", // Set the background color for today's cell
        },
      };
    }

    return {};
  };

  const handleNavigate = (newDate, view, action) => {
    if (
      action === "DATE" &&
      !props.leaveManagementFormState &&
      !props.showEventDetail
    ) {
      setSelectedDate(newDate);
      setShowModal(true);
    }
  };

  const CustomToolbar = ({ label, onNavigate, onView }) => {
    // Generate an array of months
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Generate an array of years (you can customize this based on your needs)
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
      years.push(year);
    }

    // Handle month selection
    const handleMonthChange = (event) => {
      const selectedMonth = event.target.value;
      const newDate = new Date(label);
      newDate.setMonth(months.indexOf(selectedMonth));
      onNavigate("MONTH", newDate);
    };

    // Handle year selection
    const handleYearChange = (event) => {
      const selectedYear = event.target.value;
      const newDate = new Date(label);
      newDate.setFullYear(selectedYear);
      onNavigate("YEAR", newDate);
    };

    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <button
            type="button"
            onClick={() => onNavigate("PREV")}
            className="rbc-btn"
          >
            Back
          </button>
        </span>
        {/* <span className="rbc-toolbar-label">{label}</span> */}
        <span className="rbc-toolbar-label">
          <select
            className="mr-2"
            value={months[new Date(label).getMonth()]}
            onChange={handleMonthChange}
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={new Date(label).getFullYear()}
            onChange={handleYearChange}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </span>
        <span className="rbc-btn-group">
          <button
            type="button"
            onClick={() => onNavigate("NEXT")}
            className="rbc-btn"
          >
            Next
          </button>
        </span>
      </div>
    );
  };

  return (
    <div className="h-full w-full">
      <Calendar
        localizer={localizer}
        events={props.eventList}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={(start, end) => {
          // Open the form to add events only when another modal is not open
          if (
            props.leaveManagementFormState ||
            props.showEventDetail ||
            showModal
          ) {
            return;
          }
          // If the user can create a site visit, open the form
          if (props.canCreateSiteVisit) {
            return props.handleLeaveManagementForm(start, end);
          }
          return;
        }}
        views={customViews} //only show month view
        // eventPropGetter={eventPropGetter} // assign the background color of events based on event type
        onSelectEvent={(event) =>
          // open the form to add events, only when another modal is not open
          props.leaveManagementFormState || showModal
            ? {}
            : props.handleSelectEvent(event)
        }
        showAllEvents //show all the events for a day in a scrollable manner
        dayPropGetter={dayPropGetter} //changes the background color of current day cell
        components={{
          toolbar: CustomToolbar, // Use your custom toolbar component
        }}
        onNavigate={handleNavigate} // display the event list for a single day when clicked on the date
      />

      {/* {showModal && (
        <LeaveDetails
          showAllEventsForDay={true}
          selectedDate={selectedDate}
          onEventDetailModalClose={closeModal}
          leaveTypes={props.leaveTypeList}
          fetchData={() => props.fetchData()}
        />
      )} */}

      {/* </div> */}
    </div>
  );
};

export default SiteVisitScheduler;
