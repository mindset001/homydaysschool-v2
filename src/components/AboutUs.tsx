import React from "react";
import homy1 from "../assets/images/homy1.jpg";

const AboutUs: React.FC = () => (
  <section id="about" className="w-full bg-white py-12 px-4 md:px-16 flex flex-col md:flex-row items-center gap-10">
    <div className="flex-1">
      <h2 className="text-3xl font-bold mb-6 text-center md:text-left">About Us</h2>
      <p className="mb-4 text-gray-700">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel nisi sit amet lorem tincidunt viverra. In euismod magna et semper malesuada. Donec convallis mauris vel sapien tincidunt, ac finibus metus varius. Nulla porttitor ligula sed massa fermentum, ut vestibulum leo bibendum. Sed viverra, libero ut tincidunt venenatis, velit libero tempor justo, nec varius lectus magna at lorem. Aenean malesuada volutpat risus, a aliquet arcu accumsan eget. Phasellus faucibus, enim vitae bibendum cursus, odio eros feugiat felis, nec congue velit ligula id ante.
      </p>
      <p className="text-gray-700">
        Pellentesque id libero justo. Ut a mauris id turpis scelerisque congue. Quisque ultricies nisl ut justo auctor, sit amet efficitur libero efficitur. Mauris quis varius neque. Nunc suscipit felis in ligula efficitur, id consequat purus malesuada. In quis tortor varius, aliquam arcu id, scelerisque risus. Fusce quis felis non nunc interdum posuere. Ut eget convallis libero, id porttitor eros.
      </p>
    </div>
    <div className="flex-1 flex justify-center">
      <img  src={homy1} alt="School Building" className="rounded-lg shadow-lg max-w-md w-full object-cover" />
    </div>
  </section>
);

export default AboutUs;
