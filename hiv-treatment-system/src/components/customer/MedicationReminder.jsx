import React, { useState, useEffect } from "react";
import {
  BellIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import medicationService from "../../services/medicationService";
import Button from "../common/Button";

const MedicationReminder = () => {
//   const [reminders, setReminders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Simplified component for testing
//   useEffect(() => {
//     // Simulate loading
//     setTimeout(() => {
//       setLoading(false);
//     }, 1000);
//   }, []);

//   if (loading) {
//     return <div className="p-4">Loading...</div>;
//   }

//   if (error) {
//     return <div className="p-4 text-red-600">{error}</div>;
//   }

//   return (
//     <div className="space-y-3">
//       <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <div className="p-2 bg-blue-100 rounded-full">
//               <BellIcon className="h-5 w-5 text-blue-600" />
//             </div>
//             <div>
//               <h4 className="font-medium text-gray-900">Biktarvy</h4>
//               <p className="text-sm text-gray-600">50mg/25mg/200mg</p>
//             </div>
//           </div>
//           <div className="text-right">
//             <div className="text-sm font-medium px-3 py-1 rounded-lg bg-blue-100 text-blue-800">
//               8:00 AM
//             </div>
//             <p className="text-xs text-gray-600 mt-1">30 phút nữa</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
};

export default MedicationReminder;
