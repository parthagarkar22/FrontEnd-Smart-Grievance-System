import React from "react";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";

const Layout = ({ children }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* --- Header Section --- */}
      <Navbar />

      {/* --- Main Content Area --- */}
      {/* flex-grow मुळे कंटेंट कमी असेल तरी फुटर स्क्रीनच्या खालीच राहील */}
      <main className="flex-grow max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* --- Footer Section --- */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Left Side: Branding */}
            <div className="text-center md:text-left">
              <p className="text-lg font-black text-blue-600 tracking-tighter">
                Smart<span className="text-gray-800">Grievance</span>
              </p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                Amravati Municipal Services
              </p>
            </div>

            {/* Center: Quick Links */}
            <div className="flex gap-6 text-sm font-bold text-gray-500">
              <Link to="/" className="hover:text-blue-600 transition">
                Home
              </Link>
              <Link to="/complaint" className="hover:text-blue-600 transition">
                Report Issue
              </Link>
              <button className="hover:text-blue-600 transition cursor-not-allowed opacity-50">
                Support
              </button>
            </div>

            {/* Right Side: Copyright */}
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                © {currentYear} SmartGrievance Portal
              </p>
              <p className="text-[10px] text-blue-500 font-bold mt-1">
                Made with ❤️ for Citizens
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-4 border-t border-gray-50 text-center">
            <p className="text-[9px] text-gray-300 font-medium uppercase tracking-[0.2em]">
              Designed & Developed for PS3 Coding Team
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
