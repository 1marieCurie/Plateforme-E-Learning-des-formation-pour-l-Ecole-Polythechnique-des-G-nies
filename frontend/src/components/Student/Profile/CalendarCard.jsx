// src/components/Student/Profile/CalendarCard.jsx

import React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { fr } from "date-fns/locale";


const CalendarCard = ({ activityDates = [] }) => {
  // Transformer les dates en objets Date
  const parsedDates = activityDates.map(dateStr => new Date(dateStr));

  return (
    <div className="bg-white shadow-md rounded-lg p-5 ">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
        Activité du mois
      </h3>
      <DayPicker
        locale={fr}
        mode="multiple"
        selected={parsedDates}
        showOutsideDays
        modifiersClassNames={{
          selected: "bg-blue-500 text-white font-bold rounded-full",
          today: "text-blue-700 font-semibold",
        }}
        className="w-full"
      />
    </div>
  );
};

export default CalendarCard;
