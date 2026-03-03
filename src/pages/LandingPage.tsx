
import React from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import AboutUs from "../components/AboutUs";
import OurValues from "../components/OurValues";
import Testimonials from "../components/Testimonials";
import AdmissionBanner from "../components/AdmissionBanner";
import NewsEvents from "../components/NewsEvents";
import Footer from "../components/Footer";

const LandingPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />
      <AboutUs />
      <OurValues />
      <Testimonials />
      <AdmissionBanner />
      <NewsEvents />
      <Footer />
    </div>
  );
};

export default LandingPage;
