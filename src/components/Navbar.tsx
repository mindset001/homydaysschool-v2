
import React, { useState } from "react";

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="w-full bg-white shadow flex items-center justify-between px-4 md:px-6 py-2 border-b border-gray-200 relative">
      <div className="flex items-center gap-2">
        <img src="/public/logo.png" alt="Homydays Logo" className="h-10 w-10" />
        <span className="font-bold hidden md:block text-lg tracking-wide">HOMYDAYS SCHOOLS</span>
      </div>
      {/* Hamburger for mobile */}
      {/* Hamburger/X button */}
      {menuOpen ? (
        <button
          className="fixed top-6 right-6 z-50 md:hidden bg-white rounded-full p-2 shadow-lg border border-gray-200"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        >
          <span className="block text-4xl font-extrabold text-gray-900" style={{ lineHeight: 1 }}>&times;</span>
        </button>
      ) : (
        <button
          className="md:hidden ml-auto z-20"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
          <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
          <span className="block w-6 h-0.5 bg-gray-800"></span>
        </button>
      )}
      {/* Nav links */}
      <div
        className={`transition-all duration-200 z-30
          ${menuOpen ? "fixed inset-0 bg-white flex flex-col items-center justify-start pt-24 gap-4 md:static md:bg-transparent md:flex-row md:pt-0 md:gap-8" : "hidden md:flex md:items-center md:justify-center md:gap-8"}
          text-gray-600 text-sm w-full md:w-auto left-0 top-0`}
      >
        <a href="#about" className="hover:text-black py-2 md:py-0" onClick={() => setMenuOpen(false)}>About</a>
        <a href="login" className="hover:text-black cursor-pointer py-2 md:py-0" onClick={() => setMenuOpen(false)}>Login</a>
        <a href="#enroll" className="hover:text-black py-2 md:py-0" onClick={() => setMenuOpen(false)}>Enroll</a>
        <a href="#values" className="hover:text-black py-2 md:py-0" onClick={() => setMenuOpen(false)}>Our Values</a>
      </div>
      {/* Contact info */}
      <div className="hidden md:flex flex-col items-end text-xs text-gray-700 gap-1">
        <div className="flex items-center gap-1">
          <span role="img" aria-label="phone">📞</span>
          0816 007 1243, 0909 590 8187
        </div>
        <div className="flex items-center gap-1">
          <span role="img" aria-label="location">📍</span>
          Dagbolu, Osogbo
        </div>
      </div>
      {/* Contact info for mobile, below menu */}
      {menuOpen && (
        <div className="flex md:hidden flex-col items-center text-xs text-gray-700 gap-1 w-full bg-white py-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <span role="img" aria-label="phone">📞</span>
            0816 007 1243, 0909 590 8187
          </div>
          <div className="flex items-center gap-1">
            <span role="img" aria-label="location">📍</span>
            Dagbolu, Osogbo
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
