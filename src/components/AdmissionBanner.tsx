import React from "react";

const AdmissionBanner: React.FC = () => (
  <section className="w-full flex justify-center py-10 px-4">
    <div className="bg-blue-50 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between w-full max-w-4xl gap-8">
      <div>
        <h3 className="text-2xl font-bold text-blue-900 mb-2">Admission in Progress!!!</h3>
        <p className="text-gray-700 mb-4">Enroll your child(ren) today to this great citadel of learning.</p>
        <ul className="flex flex-wrap gap-4 text-blue-900 font-medium text-sm mb-4">
          <li>Kindergaten</li>
          <li>Creche</li>
          <li>Nursery</li>
          <li>Primary</li>
          <li>Secondary</li>
        </ul>
      </div>
      <button className="bg-blue-400 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-lg transition">ENROLL NOW</button>
    </div>
  </section>
);

export default AdmissionBanner;
