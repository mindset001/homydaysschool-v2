import React from "react";

const values = [
  {
    title: "Dedication",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel nisi sit amet lorem tincidunt viverra. In euismod magna et semper malesuada. Donec convallis mauris vel sapien tincidunt, ac finibus metus varius. Nulla porttitor ligula sed massa fermentum, ut vestibulum leo bibendum.",
    icon: "/assets/images/value-icon.png",
  },
  {
    title: "Dedication",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel nisi sit amet lorem tincidunt viverra. In euismod magna et semper malesuada. Donec convallis mauris vel sapien tincidunt, ac finibus metus varius. Nulla porttitor ligula sed massa fermentum, ut vestibulum leo bibendum.",
    icon: "/assets/images/value-icon.png",
  },
  {
    title: "Dedication",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel nisi sit amet lorem tincidunt viverra. In euismod magna et semper malesuada. Donec convallis mauris vel sapien tincidunt, ac finibus metus varius. Nulla porttitor ligula sed massa fermentum, ut vestibulum leo bibendum.",
    icon: "/assets/images/value-icon.png",
  },
];

const OurValues: React.FC = () => (
  <section id="values" className="w-full py-12 px-4 bg-blue-50">
    <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
    <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
      {values.map((value, idx) => (
        <div
          key={idx}
          className="bg-white rounded-lg shadow p-6 flex-1 max-w-sm w-full flex flex-col gap-4 items-center"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">{value.title}</span>
            <img src={value.icon} alt="Value Icon" className="w-8 h-8" />
          </div>
          <p className="text-gray-700 text-sm text-center">{value.description}</p>
        </div>
      ))}
    </div>
  </section>
);

export default OurValues;
