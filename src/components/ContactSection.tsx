import React, { useState } from "react";

interface FormState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const initialForm: FormState = { name: "", email: "", phone: "", message: "" };

const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate sending — replace with real API call when backend endpoint is ready
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setSubmitted(true);
    setFormData(initialForm);
  };

  return (
    <section id="contact" className="w-full py-14 px-4 md:px-16 bg-gray-50">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-start">
        {/* Info */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
          <p className="text-gray-600 mb-6">
            Have questions about admission, fees, or the school portal? Reach out to us and we'll
            get back to you as soon as possible.
          </p>
          <div className="flex flex-col gap-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <span className="text-xl">📍</span>
              <span>Adjacent Dipson Plastic, Dagbolu International Market, Osogbo, Osun State.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">📞</span>
              <span>0816 007 1243 &nbsp;|&nbsp; 0909 590 8187</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">✉️</span>
              <span>homydaysschools@gmail.com</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">🕐</span>
              <span>Monday – Friday: 8:00 am – 4:00 pm</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 w-full">
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-xl font-bold text-green-700 mb-2">Message Sent!</h3>
              <p className="text-green-600 text-sm">
                Thank you for reaching out. We'll get back to you shortly.
              </p>
              <button
                className="mt-5 text-sm text-green-700 underline"
                onClick={() => setSubmitted(false)}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-xl shadow p-6 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05878F]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05878F]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="08XXXXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05878F]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Message</label>
                <textarea
                  name="message"
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05878F] resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="bg-[#05878F] hover:bg-[#046a71] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm disabled:opacity-60"
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
