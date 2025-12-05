// src/pages/user/Courses.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Toaster } from "react-hot-toast";
import Linkify from "react-linkify";

const sampleCourses = [
  {
    _id: "1",
    name: "Full Stack Web Development",
    institution: "Tech University",
    qualification: "Degree",
    duration: "4 Years",
    category: "Information Technology",
    description:
      "Learn MERN Stack development and build real-world web apps. More info: https://techuni.edu/webdev",
  },
  {
    _id: "2",
    name: "Digital Marketing Mastery",
    institution: "Bright Future Academy",
    qualification: "Diploma",
    duration: "1 Year",
    category: "Digital Marketing",
    description:
      "Master SEO, SEM, and Social Media Marketing. Visit https://brightfuture.lk for details.",
  },
  {
    _id: "3",
    name: "Mechanical Engineering",
    institution: "Engineering Institute",
    qualification: "Degree",
    duration: "4 Years",
    category: "Engineering",
    description:
      "A complete course on mechanical systems and design principles.",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Information Technology": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  "Business & Management": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  Engineering: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  "Digital Marketing": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  Healthcare: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
};

const CoursePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-10">
      <Toaster position="top-center" />

      {/* ===== Header ===== */}
      <h1 className="text-4xl font-bold text-center mb-10 text-blue-700 dark:text-blue-300 drop-shadow-sm">
        🎓 Available Courses
      </h1>

      {/* ===== Search Inputs ===== */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8">
        <Input
          placeholder="Filter by Qualification (e.g., Degree, Diploma)..."
          className="w-full md:w-80 border border-blue-400 dark:border-blue-700 rounded-xl p-3 bg-white dark:bg-gray-800 dark:text-white shadow-sm"
        />
        <Input
          placeholder="Search by Course or Institution..."
          className="w-full md:w-80 border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-800 dark:text-white shadow-sm"
        />
      </div>

      {/* ===== Category Buttons ===== */}
      <div className="flex justify-center gap-4 flex-wrap mb-10">
        {[
          "All",
          "Information Technology",
          "Business & Management",
          "Engineering",
          "Digital Marketing",
          "Healthcare",
        ].map((cat, idx) => (
          <button
            key={idx}
            className="px-4 py-2 rounded-full font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition shadow-sm"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ===== Course Cards ===== */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {sampleCourses.map((course) => (
          <Card
            key={course._id}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-md rounded-2xl p-6 transition hover:shadow-xl hover:-translate-y-1"
          >
            <CardContent className="space-y-3">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {course.name}
                </h2>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    CATEGORY_COLORS[course.category] ||
                    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {course.category}
                </span>
              </div>

              {/* ===== Course Details ===== */}
              <div className="text-sm space-y-2">
                <p className="bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-md font-medium inline-block">
                  Institution: {course.institution}
                </p>
                <p className="bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-100 px-3 py-1 rounded-md font-medium inline-block">
                  Qualification: {course.qualification}
                </p>
                <p className="bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-3 py-1 rounded-md font-medium inline-block">
                  Duration: {course.duration}
                </p>
              </div>

              {/* ===== Description ===== */}
              <div className="text-gray-700 dark:text-gray-300 text-sm border-t border-gray-200 dark:border-gray-700 pt-3 break-words">
                <strong className="text-gray-800 dark:text-gray-100 block mb-1">
                  Description:
                </strong>
                <Linkify
                  componentDecorator={(href, text, key) => (
                    <a
                      href={href}
                      key={key}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      {text}
                    </a>
                  )}
                >
                  {course.description}
                </Linkify>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CoursePage;
