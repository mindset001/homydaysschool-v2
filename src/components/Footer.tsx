import React from "react";
import Logo from "../../public/logo.png";

const Footer: React.FC = () => (
  <footer className="w-full bg-gray-900 text-white pt-12 pb-4 px-4 mt-8">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
      <div className="flex flex-col gap-2 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <img src={Logo} alt="homydays Logo" className="h-12 w-12" />
          <span className="font-bold text-lg">HOMYDAYS SCHOOLS</span>
        </div>
        <div className="text-sm">
          Adjacent Dipson Plastic, Dagbolu international Market, Osogbo.
        </div>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <a href="#login" className="hover:underline">Portal Login</a>
        <a href="#news" className="hover:underline">News</a>
        <a href="#testimonials" className="hover:underline">Testimonials</a>
        <a href="#values" className="hover:underline">Our Values</a>
        <a href="#about" className="hover:underline">About Us</a>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span role="img" aria-label="twitter">🐦</span> Homydays_Schools
        </div>
        <div className="flex items-center gap-2">
          <span role="img" aria-label="instagram">📸</span> Homydays_Schools
        </div>
        <div className="flex items-center gap-2">
          <span role="img" aria-label="email">✉️</span> homydaysschools@gmail.com
        </div>
        <div className="flex items-center gap-2">
          <span role="img" aria-label="phone">📞</span> 0816 007 1243, 0909 590 8187
        </div>
      </div>
    </div>
    <div className="border-t border-gray-700 mt-8 pt-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-300">
      <div className="flex gap-4 mb-2 md:mb-0">
        <span>Terms and Condition</span>
        <span>Privacy Policy</span>
      </div>
      <div>
        ©Homydays Schools. Developed by Demlynks Technologies
      </div>
    </div>
  </footer>
);

export default Footer;
