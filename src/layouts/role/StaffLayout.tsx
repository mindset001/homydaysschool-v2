import React from 'react'
import { getRole } from '../../utils/authTokens';
import Staff from '../../pages/dashboard/Staff';
import TeacherDashboard from '../../pages/staff-dashboard/TeacherDashboard';

const StaffLayout : React.FC = () => {
    // CHANGE ROLE
  // const [role] = useState("admin");
  const role = getRole();
  return (
    role === "staff" ? <TeacherDashboard /> : <Staff />
  )
}

export default StaffLayout