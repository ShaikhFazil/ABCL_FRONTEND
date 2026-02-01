import { Outlet, useLocation } from "react-router-dom";
import StudentViewCommonHeader from "./Header";
import StudentViewCommonFooter from "./footer";

function StudentViewCommonLayout() {
  const location = useLocation();

  const hideHeaderFooter = location.pathname.includes("course-progress");

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeaderFooter && <StudentViewCommonHeader />}

      {/* Main content */}
      <div className="flex-1">
        <Outlet />
      </div>

      {!hideHeaderFooter && <StudentViewCommonFooter />}
    </div>
  );
}

export default StudentViewCommonLayout;
