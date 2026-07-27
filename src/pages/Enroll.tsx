import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { submitEnrollmentApplication } from "../services/api/calls/postApis";

const LEVELS = ["Creche", "Nursery", "Kindergarten", "Primary", "Secondary"];

interface FormState {
  childFullName: string;
  dateOfBirth: string;
  desiredLevel: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  message: string;
}

const initialForm: FormState = {
  childFullName: "",
  dateOfBirth: "",
  desiredLevel: "",
  guardianName: "",
  guardianEmail: "",
  guardianPhone: "",
  message: "",
};

const Enroll: React.FC = () => {
  const [formData, setFormData] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await submitEnrollmentApplication(formData);
      setSubmitted(true);
      setFormData(initialForm);
    } catch {
      setError("Something went wrong submitting your application. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Enroll — Homydays Schools</title>
        <meta
          name="description"
          content="Start your child's enrollment at Homydays Schools — Creche through Secondary School. Admissions open for the 2025/2026 academic session."
        />
      </Helmet>

      <div className="bg-gray-50 min-h-screen flex flex-col">
        <Navbar />

        <section id="enroll" className="w-full py-14 px-4 md:px-16 flex-1">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#F97316] mb-2">
                Admissions Open — 2025/2026 Academic Session
              </p>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Enroll Your Child</h1>
              <p className="text-gray-600">
                Fill in the form below and our admissions office will reach out to guide you
                through the next steps — from Creche through Secondary School.
              </p>
            </div>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-xl font-bold text-green-700 mb-2">Application Received!</h3>
                <p className="text-green-600 text-sm">
                  Thank you for your interest in Homydays Schools. Our admissions office will
                  contact you shortly.
                </p>
                <button
                  className="mt-5 text-sm text-green-700 underline"
                  onClick={() => setSubmitted(false)}
                >
                  Submit another application
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow p-6 flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Child's Full Name</label>
                  <input
                    type="text"
                    name="childFullName"
                    placeholder="Child's full name"
                    value={formData.childFullName}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Desired Level</label>
                    <select
                      name="desiredLevel"
                      value={formData.desiredLevel}
                      onChange={handleChange}
                      required
                      className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316] bg-white"
                    >
                      <option value="" disabled>
                        Select a level
                      </option>
                      {LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Parent/Guardian Full Name
                  </label>
                  <input
                    type="text"
                    name="guardianName"
                    placeholder="Your full name"
                    value={formData.guardianName}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      name="guardianEmail"
                      placeholder="your@email.com"
                      value={formData.guardianEmail}
                      onChange={handleChange}
                      required
                      className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      name="guardianPhone"
                      placeholder="08XXXXXXXXX"
                      value={formData.guardianPhone}
                      onChange={handleChange}
                      required
                      className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Additional Notes (optional)
                  </label>
                  <textarea
                    name="message"
                    placeholder="Anything else we should know?"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316] resize-none"
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-[#F97316] hover:bg-[#046a71] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm disabled:opacity-60"
                >
                  {sending ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Enroll;
