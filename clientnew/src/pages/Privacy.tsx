import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 lg:py-20">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent animate-gradient-shift">
          Privacy Policy
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          At CareerLink LK, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.
        </p>
      </div>

      {/* Content Card */}
      <div className="bg-card dark:bg-card-foreground dark:text-card p-8 rounded-xl shadow-card space-y-8">
        <Section
          title="1. Information We Collect"
          list={[
            "Personal information such as name, email, phone number, and qualifications when you register.",
            "Usage data like pages visited, features used, and interactions with the platform.",
            "Device information including IP address, browser type, and operating system."
          ]}
        />
        <Section
          title="2. How We Use Your Information"
          list={[
            "To provide and improve our services, including job matching and course recommendations.",
            "To personalize your CareerLink LK experience.",
            "To communicate with you about updates, opportunities, or support requests."
          ]}
        />
        <Section
          title="3. Sharing of Information"
          content="We do not sell your personal data. Information may be shared only with trusted partners (e.g., employers, educational institutions) strictly for the purposes of recruitment or course enrollment."
        />
        <Section
          title="4. Data Security"
          content="We use appropriate technical and organizational measures to safeguard your data against unauthorized access, disclosure, alteration, or destruction."
        />
        <Section
          title="5. Your Rights"
          list={[
            "Access and update your personal information in your account settings.",
            "Request deletion of your data by contacting support@careerlink.lk.",
            "Opt-out of promotional emails at any time."
          ]}
        />
        <Section
          title="6. Cookies & Tracking"
          content="CareerLink LK uses cookies and similar technologies to improve user experience, analyze trends, and deliver personalized content."
        />
        <Section
          title="7. Updates to Privacy Policy"
          content="We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated revision date."
        />
        <Section
          title="8. Contact Us"
          content="If you have any questions about this Privacy Policy, please contact us at support@careerlink.lk."
        />

        <p className="mt-6 text-center text-muted-foreground">
          Your trust is important to us. We are dedicated to keeping your information secure and transparent in how it is used.
        </p>
      </div>
    </div>
  );
};

// Reusable Section component
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

export default PrivacyPolicy;
