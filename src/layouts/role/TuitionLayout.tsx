import React from 'react'
import { getRole } from '../../utils/authTokens';
import Tuition from '../../pages/dashboard/Tuition';

const TuitionLayout : React.FC = () => {
  // CHANGE ROLE
  // const [role] = useState("admin");
  const role = getRole();
  return (
    role === "admin"? <Tuition /> : null
  )
}

export default TuitionLayout