import React from "react";

const Footer: React.FC = () => (
  <footer className="w-full bg-gray-900 text-white pt-12 pb-4 px-4 mt-8">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
      <div className="flex flex-col gap-2 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <img src="/assets/images/school-logo.png" alt="Zenith International Schools Logo" className="h-12 w-12" />
          <span className="font-bold text-lg">ZENITH INTERNATIONAL SCHOOLS</span>
        </div>
        <div className="text-sm">
          1, Dr. R.O. Adeleke Street, Behind ADS Grammar School, Off Oba Adesoji Aderemi, Ring Road, Iludun Osogbo.
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
          <span role="img" aria-label="twitter">🐦</span> Zenith_Schools
        </div>
        <div className="flex items-center gap-2">
          <span role="img" aria-label="instagram">📸</span> Zenith._Schools
        </div>
        <div className="flex items-center gap-2">
          <span role="img" aria-label="email">✉️</span> zenithhighschoolosogbo@gmail.com
        </div>
        <div className="flex items-center gap-2">
          <span role="img" aria-label="phone">📞</span> 0814 515 9459, 0909 590 8187
        </div>
      </div>
    </div>
    <div className="border-t border-gray-700 mt-8 pt-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-300">
      <div className="flex gap-4 mb-2 md:mb-0">
        <span>Terms and Condition</span>
        <span>Privacy Policy</span>
      </div>
      <div>
        ©Zenith International Schools. Developed by Demlinks Technologies
      </div>
    </div>
  </footer>
);

export default Footer;
