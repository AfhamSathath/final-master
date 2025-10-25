import React from "react";

const ContactUs: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 lg:py-20">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent animate-gradient-shift">
          Contact Us
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Have questions or need help? Reach out to the CareerLink LK team — we’re here to assist you.
        </p>
      </div>

      {/* Content Card */}
      <div className="bg-card dark:bg-card-foreground dark:text-card p-8 rounded-xl shadow-card space-y-8">
        <Section
          title="1. General Inquiries"
          content="For general questions about CareerLink LK, please email us at support@careerlink.lk."
        />
        <Section
          title="2. Technical Support"
          content="If you encounter technical issues with the platform, report them via the Help Center or email techsupport@careerlink.lk."
        />
        <Section
          title="3. Partnerships & Collaborations"
          content="Interested in partnering with CareerLink LK for job postings, courses, or events? Contact us at partnerships@careerlink.lk."
        />
        <Section
          title="4. Office Address"
          content="CareerLink LK HQ, 123 Main Street, Colombo, Sri Lanka."
        />

        {/* Optional Contact Form */}
        <Section title="5. Send Us a Message">
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-3 rounded-lg border border-muted focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full px-4 py-3 rounded-lg border border-muted focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <textarea
              placeholder="Your Message"
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-muted focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <button
              type="submit"
              className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              Send Message
            </button>
          </form>
        </Section>

        <p className="mt-6 text-center text-muted-foreground">
          We aim to respond to all inquiries within 24–48 hours.
        </p>
      </div>
    </div>
  );
};

// Reusable Section component (same as HelpCenter & PrivacyPolicy)
const Section: React.FC<{ title: string; content?: string; list?: string[]; children?: React.ReactNode }> = ({
  title,
  content,
  list,
  children,
}) => {
  return (
    <div className="space-y-3 animate-fade-in-up">
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      {content && <p className="text-muted-foreground">{content}</p>}
      {list && (
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          {list.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      )}
      {children}
    </div>
  );
};

export default ContactUs;
