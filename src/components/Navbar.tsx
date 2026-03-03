import React from "react";

const Navbar: React.FC = () => (
  <nav className="w-full bg-white shadow flex items-center justify-between px-6 py-2 border-b border-gray-200">
    <div className="flex items-center gap-2">
      <img src="/assets/images/school-logo.png" alt="Zenith International Schools Logo" className="h-10 w-10" />
      <span className="font-bold text-lg tracking-wide">HOMYDAYS SCHOOLS</span>
    </div>
    <div className="flex-1 flex items-center justify-center gap-8 text-gray-600 text-sm">
      <a href="#about" className="hover:text-black">About</a>
      <a href="login" className="hover:text-black cursor-pointer">Login</a>
      <a href="#enroll" className="hover:text-black">Enroll</a>
      <a href="#values" className="hover:text-black">Our Values</a>
    </div>
    <div className="flex flex-col items-end text-xs text-gray-700 gap-1">
      <div className="flex items-center gap-1">
        <span role="img" aria-label="phone">📞</span>
        0816 007 1243, 0909 590 8187
      </div>
      <div className="flex items-center gap-1">
        <span role="img" aria-label="location">📍</span>
        Dagbolu, Osogbo
      </div>
    </div>
  </nav>
);

export default Navbar;
