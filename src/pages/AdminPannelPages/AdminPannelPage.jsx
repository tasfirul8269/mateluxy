import { Outlet } from "react-router-dom";

const AdminPannelPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Outlet />
    </div>
  );
}

export default AdminPannelPage; 