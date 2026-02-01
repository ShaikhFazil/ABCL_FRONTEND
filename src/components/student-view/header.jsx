import { GraduationCap, TvMinimalPlay, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/auth-context";

function StudentViewCommonHeader() {
  const navigate = useNavigate();
  const { resetCredentials } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
  }

  return (
    <>
      <header className="flex items-center justify-between p-4 border-b relative">
        {/* Left section: Logo and navigation */}
        <div className="flex items-center space-x-4">
          <Link to="/home" className="flex items-center hover:text-black">
            <GraduationCap className="h-6 w-6 md:h-8 md:w-8 mr-2 md:mr-4" />
            <span className="font-extrabold text-sm md:text-xl whitespace-nowrap">
              ABCL
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Button
              variant="ghost"
              onClick={() => {
                location.pathname.includes("/courses")
                  ? null
                  : navigate("/courses");
              }}
              className="text-sm font-medium"
            >
              Explore Courses
            </Button>
          </div>
        </div>

        {/* Right section: Desktop menu */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex gap-4 items-center">
            <div
              onClick={() => navigate("/student-courses")}
              className="flex cursor-pointer items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <span className="font-extrabold text-lg">
                My Courses
              </span>
              <TvMinimalPlay className="w-6 h-6" />
            </div>
            <Button onClick={handleLogout} size="default">Sign Out</Button>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center justify-center p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </header>

      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b shadow-lg animate-slideDown">
          <div className="flex flex-col p-4 space-y-4">
            {/* Mobile Explore Courses */}
            <Button
              variant="ghost"
              onClick={() => {
                setIsMenuOpen(false);
                if (!location.pathname.includes("/courses")) {
                  navigate("/courses");
                }
              }}
              className="justify-start text-left w-full py-3 text-base font-medium"
            >
              Explore Courses
            </Button>

            {/* Mobile My Courses */}
            <div
              onClick={() => {
                setIsMenuOpen(false);
                navigate("/student-courses");
              }}
              className="flex cursor-pointer items-center gap-3 py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <TvMinimalPlay className="w-5 h-5 flex-shrink-0" />
              <span className="font-semibold text-base">My Courses</span>
            </div>

            {/* Divider */}
            <div className="border-t my-2"></div>

            {/* Mobile Sign Out */}
            <Button 
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
              className="w-full py-3"
            >
              Sign Out
            </Button>
          </div>
        </div>
      )}

      {/* Add this to your global CSS for the animation */}
      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </>
  );
}

export default StudentViewCommonHeader;