import React from 'react'
import { getRole } from '../../utils/authTokens';
import Staff from '../../pages/dashboard/Staff';

const StaffLayout : React.FC = () => {
    // CHANGE ROLE
  // const [role] = useState("admin");
  const role = getRole();
  return (
    (role === "admin" || role === "guardian") ? <Staff /> : null
  )
}

export default StaffLayout