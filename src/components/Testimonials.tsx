import React from "react";

const testimonials = [
  {
    name: "Mrs. Adepoju",
    rating: 5.0,
    text: "Enrolling my children in Homydays Schools was the best decision I ever made. The teachers are dedicated and the environment is very conducive for learning.",
    image: "/assets/images/testimonial1.jpg",
  },
  {
    name: "Mr. Odewale",
    rating: 4.5,
    text: "My son's academic performance improved tremendously since he joined Homydays. The management is responsive and the school portal makes it easy to monitor his progress.",
    image: "/assets/images/testimonial1.jpg",
  },
  {
    name: "Mr. Alabi",
    rating: 5.0,
    text: "I am very impressed with the level of discipline and academic excellence at Homydays Schools. My daughter loves going to school every day!",
    image: "/assets/images/testimonial1.jpg",
  },
  {
    name: "Mrs. Williams",
    rating: 4.5,
    text: "The staff are caring and professional. The school's commitment to the all-round development of every student is evident in everything they do.",
    image: "/assets/images/testimonial1.jpg",
  },
  {
    name: "Mr. AbdulGaniyu",
    rating: 5.0,
    text: "Homydays Schools gave my children a solid educational foundation. I have no hesitation recommending this school to any parent who wants the best for their child.",
    image: "/assets/images/testimonial1.jpg",
  },
  {
    name: "Mr. Afolayanka",
    rating: 4.5,
    text: "The school portal is a fantastic tool — I can check my child's results and timetable anytime. Homydays truly embraces modern education.",
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
