import React from "react";

const values = [
  {
    title: "Excellence",
    description:
      "We uphold the highest academic and moral standards, challenging every student to reach their full potential through rigorous learning and dedicated mentorship.",
    icon: "/assets/images/value-icon.png",
  },
  {
    title: "Discipline",
    description:
      "We instil a culture of responsibility, punctuality and respect — training students to become principled leaders who contribute positively to their communities.",
    icon: "/assets/images/value-icon.png",
  },
  {
    title: "Innovation",
    description:
      "We embrace creative thinking and modern teaching methods, equipping our students with the skills needed to thrive in an ever-changing world.",
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
