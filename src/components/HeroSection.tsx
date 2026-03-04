
import homy1 from "../assets/images/homy1.jpg";
import homy2 from "../assets/images/homy2.jpg";
import homy3 from "../assets/images/homy3.jpg";
import homy4 from "../assets/images/new.jpg";

const heroImages = [homy1, homy2, homy3, homy4];

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[60vh] flex flex-col justify-end bg-black">
      {/* Background Image */}
      <img
        src={heroImages[0]}
        alt="Classroom"
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      {/* Content */}
      <div className="relative z-10 px-4 sm:px-8 py-10 md:px-20 flex flex-col gap-4 w-full max-w-5xl mx-auto">
        <h2 className="text-white text-base sm:text-lg font-light mb-1 sm:mb-2">Welcome to</h2>
        <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-2 leading-tight">
          Homydays Schools
        </h1>
        <p className="text-blue-200 italic mb-4 sm:mb-6 text-sm sm:text-base">For a Brighter Future</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 w-full sm:w-auto">
          <a href="/login" className="bg-white text-black px-6 py-2 rounded shadow font-semibold hover:bg-blue-100 transition text-center">
            Login
          </a>
          <button className="bg-black/60 text-white px-6 py-2 rounded border border-white hover:bg-white hover:text-black transition text-center">
            Enroll
          </button>
        </div>
        {/* Carousel Thumbnails */}
        <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
          {heroImages.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Slide ${idx + 1}`}
              className="w-20 h-16 sm:w-24 sm:h-20 object-cover rounded shadow border-2 border-white"
            />
          ))}
        </div>
        {/* Carousel Controls */}
        <div className="flex gap-2 mt-2 justify-center sm:justify-start">
          <button className="w-8 h-8 flex items-center justify-center bg-white/80 rounded hover:bg-white">
            &#8592;
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-white/80 rounded hover:bg-white">
            &#8594;
          </button>
        </div>
      </div>
    </section>
  );
}
