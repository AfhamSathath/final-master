import React from "react";

const TermsOfService: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 lg:py-20">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent animate-gradient-shift">
          Terms of Service
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Please read these Terms of Service carefully before using CareerLink LK. By accessing or using our platform, you agree to be bound by these terms.
        </p>
      </div>

      {/* Content Card */}
      <div className="bg-card dark:bg-card-foreground dark:text-card p-8 rounded-xl shadow-card space-y-8">
        <Section
          title="1. Acceptance of Terms"
          content="By accessing or using CareerLink LK, you confirm that you have read, understood, and agreed to these Terms of Service."
        />
        <Section
          title="2. User Responsibilities"
          list={[
            "Provide accurate and truthful information when creating your account.",
            "Maintain the confidentiality of your login credentials.",
            "Use the platform only for lawful purposes, such as finding jobs or courses."
          ]}
        />
        <Section
          title="3. Prohibited Activities"
          list={[
            "Posting misleading, offensive, or illegal content.",
            "Attempting to hack, disrupt, or misuse the platform.",
            "Impersonating another person or entity."
          ]}
        />
        <Section
          title="4. Intellectual Property"
          content="All content, trademarks, and materials available on CareerLink LK are the property of CareerLink LK or its partners. You may not use them without permission."
        />
        <Section
          title="5. Termination of Access"
          content="We reserve the right to suspend or terminate your account if you violate these Terms of Service or misuse the platform."
        />
        <Section
          title="6. Limitation of Liability"
          content="CareerLink LK is not responsible for any direct, indirect, or incidental damages that may arise from the use of the platform, including interactions with employers or institutions."
        />
        <Section
          title="7. Changes to Terms"
          content="We may update these Terms of Service from time to time. Continued use of the platform after changes means you accept the updated terms."
        />
        <Section
          title="8. Governing Law"
          content="These Terms are governed by the laws of Sri Lanka. Any disputes shall be resolved under the jurisdiction of Sri Lankan courts."
        />
        <Section
          title="9. Contact Information"
          content="If you have any questions about these Terms of Service, please contact us at support@careerlink.lk."
        />

        <p className="mt-6 text-center text-muted-foreground">
          Thank you for using CareerLink LK responsibly. We are committed to helping you connect with opportunities while maintaining a safe and trustworthy platform.
        </p>
      </div>
    </div>
  );
};

// Reusable Section Component
const Section: React.FC<{ title: string; content?: string; list?: string[] }> = ({
  title,
  content,
  list,
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
    </div>
  );
};

export default TermsOfService;
