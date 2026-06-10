import React, { useState } from "react";

const FAQS = [
  {
    question: "How do I enroll my child in Homydays Schools?",
    answer:
      "Visit our website and click the Enroll button, or contact our admissions office directly. We accept students from Creche through Secondary School. Limited spaces are available for the 2025/2026 session.",
  },
  {
    question: "What classes does Homydays Schools offer?",
    answer:
      "We offer classes from Creche, Nursery 1 & 2, Kindergarten 1 & 2, Primary 1–6, Junior Secondary School (JSS 1–3), and Senior Secondary School (SSS 1–3).",
  },
  {
    question: "Is Homydays Schools currently accepting admissions?",
    answer:
      "Yes! Homydays Schools is open for admissions for the 2025/2026 Academic Session — 3rd Term. Spaces are limited, so we encourage early application.",
  },
  {
    question: "How can I check my child's school fees balance?",
    answer:
      "Guardians can log in to the Homydays Schools parent portal at homydaysschools.sch.ng/login to view their child's fees balance, payment history, and outstanding balances per term.",
  },
  {
    question: "How can I view my child's results?",
    answer:
      "Academic results are available through the parent portal after login. Results for a term are only accessible once all school fees for that term have been cleared.",
  },
  {
    question: "What is the school fees for Homydays Schools?",
    answer:
      "School fees vary by class level — from Creche to Secondary School. Please contact our admissions office or log in to the parent portal for the current fee schedule.",
  },
];

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="w-full py-14 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <p className="text-xs font-semibold uppercase tracking-widest text-[#F97316] mb-2 text-center">
          Got Questions?
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">
          Frequently Asked Questions
        </h2>

        {/* Accordion */}
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "border-[#F97316] bg-[#f0fafb]"
                    : "border-gray-200 bg-white hover:border-[#F97316]/40"
                }`}
              >
                {/* Question row */}
                <button
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                >
                  <span
                    className={`text-[14px] font-semibold leading-snug ${
                      isOpen ? "text-[#F97316]" : "text-gray-800"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                      isOpen
                        ? "bg-[#F97316] border-[#F97316] text-white"
                        : "border-gray-300 text-gray-400"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </button>

                {/* Answer */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="px-5 pb-5 text-[13px] text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
