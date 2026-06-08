import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import AboutUs from "../components/AboutUs";
import OurValues from "../components/OurValues";
import Testimonials from "../components/Testimonials";
import AdmissionBanner from "../components/AdmissionBanner";
import NewsEvents from "../components/NewsEvents";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";
import FAQSection from "../components/FAQSection";

const SITE_URL = "https://homydaysschools.sch.ng";

const LandingPage: React.FC = () => {
  return (
    <>
      <Helmet>
        {/* Primary */}
        <title>Homydays Schools — Creche, Nursery, Primary &amp; Secondary School</title>
        <meta
          name="description"
          content="Homydays Schools offers world-class education from Creche to Secondary School. Nurturing young minds with excellence, values, and a brighter future. Admissions open for 2025/2026."
        />
        <link rel="canonical" href={SITE_URL} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content="Homydays Schools — For a Brighter Future" />
        <meta
          property="og:description"
          content="Homydays Schools offers world-class education from Creche to Secondary School. Admissions open for 2025/2026 Academic Session."
        />
        <meta property="og:image" content={`${SITE_URL}/hero.jpeg`} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Homydays Schools — For a Brighter Future" />
        <meta
          name="twitter:description"
          content="World-class education from Creche to Secondary School. Admissions open for 2025/2026."
        />
        <meta name="twitter:image" content={`${SITE_URL}/hero.jpeg`} />
      </Helmet>

      <div className="bg-gray-50 min-h-screen flex flex-col">
        <Navbar />
        <HeroSection />
        <AboutUs />
        <OurValues />
        <Testimonials />
        <FAQSection />
        <AdmissionBanner />
        <NewsEvents />
        <ContactSection />
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;
