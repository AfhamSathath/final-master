import React from "react";

const HelpCenter: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 lg:py-20">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent animate-gradient-shift">
          Help Center
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Welcome to the Help Center. Find FAQs, guides, and resources to assist you with your CareerLink LK experience.
        </p>
      </div>

      {/* Content Card */}
      <div className="bg-card dark:bg-card-foreground dark:text-card p-8 rounded-xl shadow-card space-y-8">
        <Section
          title="1. Getting Started"
          content="Learn how to create an account, complete your profile, and start exploring job opportunities or courses on CareerLink LK."
        />
        <Section
          title="2. Account Management"
          content="Guidance on updating your profile, changing your password, and managing notification preferences."
        />
        <Section
          title="3. Job Applications"
          content="Learn how to search for jobs, submit applications, track your applications, and communicate with employers."
        />
        <Section
          title="4. Courses & Learning"
          content="Instructions on browsing available courses, enrolling, and accessing learning materials."
        />
        <Section
          title="5. FAQs"
          list={[
            "How do I reset my password?",
            "How do I update my profile information?",
            "How do I contact employers directly?",
            "What if I encounter technical issues?",
          ]}
        />
        <Section
          title="6. Support & Contact"
          content="If you need further assistance, you can reach out to our support team via the Contact Us page or email support@careerlink.lk."
        />
        <Section
          title="7. Reporting Issues"
          content="Report inappropriate content, bugs, or platform misuse through the designated reporting feature to ensure a safe and productive environment."
        />

        <p className="mt-6 text-center text-muted-foreground">
          Our Help Center is continuously updated to provide you with the best guidance and support for your CareerLink LK experience.
        </p>
      </div>
    </div>
  );
};

// Reusable section component
const Section: React.FC<{ title: string; content?: string; list?: string[] }> = ({ title, content, list }) => {
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

export default HelpCenter;
