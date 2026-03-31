import React from "react";
import homyVideo from "../assets/videos/homy.mp4";

const AboutUs: React.FC = () => (
  <section id="about" className="w-full bg-white py-12 px-4 md:px-16 flex flex-col md:flex-row items-center gap-10">
    <div className="flex-1">
      <h2 className="text-3xl font-bold mb-6 text-center md:text-left">About Us</h2>
      <p className="mb-4 text-gray-700">
        Homydays Schools is a forward-thinking educational institution located in the heart of Osogbo, Osun State. Founded on the belief that every child deserves a world-class education, we provide a nurturing environment where students from Crèche through to Secondary School are empowered to excel academically, socially and morally.
      </p>
      <p className="text-gray-700">
        Our experienced team of educators combines modern teaching methodologies with strong moral values to produce well-rounded graduates who are ready to lead in tomorrow's world. We are proud of our track record of outstanding results and our commitment to the holistic development of every child in our care.
      </p>
    </div>
    <div className="flex-1 flex justify-center">
      <video
        src={homyVideo}
        className="rounded-lg shadow-lg max-w-md w-full object-cover max-h-64"
        autoPlay
        loop
        playsInline
        controls
      />
    </div>
  </section>
);

export default AboutUs;
