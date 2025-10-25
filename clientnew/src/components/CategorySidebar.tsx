// src/components/CategorySidebar.tsx
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const categories = ["it", "management", "hr", "marketing", "finance"]; // add more

const CategorySidebar: React.FC = () => {
  const router = useRouter();
  const currentCategory = router.query.category?.toString();

  return (
    <aside className="w-48 bg-gray-100 p-4 rounded">
      <h2 className="text-lg font-bold mb-4">Categories</h2>
      <ul className="flex flex-col gap-2">
        {categories.map((cat) => (
          <li key={cat}>
            <Link href={`/admin/jobs/${cat}`}>
              <a
                className={`block px-3 py-2 rounded hover:bg-blue-500 hover:text-white ${
                  currentCategory === cat ? "bg-blue-600 text-white" : "text-gray-700"
                }`}
              >
                {cat.toUpperCase()}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default CategorySidebar;
