import React from "react";

const testimonials = [
  {
    name: "Mrs. Adepoju",
    rating: 4.0,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel nisi sit amet lorem tincidunt viverra. In euismod magna et semper malesuada.",
    image: "/assets/images/testimonial1.jpg",
  },
  {
    name: "Mr Odewale",
    rating: 4.0,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel nisi sit amet lorem tincidunt viverra. In euismod magna et semper malesuada.",
    image: "/assets/images/testimonial1.jpg",
  },
  {
    name: "Mr Alabi",
    rating: 4.0,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel nisi sit amet lorem tincidunt viverra. In euismod magna et semper malesuada.",
    image: "/assets/images/testimonial1.jpg",
  },
  {
    name: "Mrs. Williams",
    rating: 4.0,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel nisi sit amet lorem tincidunt viverra. In euismod magna et semper malesuada.",
    image: "/assets/images/testimonial1.jpg",
  },
  {
    name: "Mr AbdulGaniyu",
    rating: 4.0,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel nisi sit amet lorem tincidunt viverra. In euismod magna et semper malesuada.",
    image: "/assets/images/testimonial1.jpg",
  },
  {
    name: "Mr Afolayanka",
    rating: 4.0,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel nisi sit amet lorem tincidunt viverra. In euismod magna et semper malesuada.",
    image: "/assets/images/testimonial1.jpg",
  },
];

const Testimonials: React.FC = () => (
  <section className="w-full py-12 px-4">
    <h2 className="text-3xl font-bold text-center mb-8">Testimonials</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {testimonials.map((t, idx) => (
        <div
          key={idx}
          className="bg-white rounded-lg shadow p-6 flex flex-col gap-4 items-start"
        >
          <div className="flex items-center gap-3 mb-2">
            <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
            <span className="font-semibold">{t.name}</span>
            <span className="ml-auto flex items-center gap-1 text-yellow-500 font-bold">
              {t.rating} <span>★</span>
            </span>
          </div>
          <p className="text-gray-700 text-sm">{t.text}</p>
        </div>
      ))}
    </div>
  </section>
);

export default Testimonials;
