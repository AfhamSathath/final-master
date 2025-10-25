// src/context/CompanyContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

export type Company = {
  _id: string;
  name: string;
  email: string;
  contactNumber: string;
  regNumber: string;
  location: string;
};

interface CompanyContextType {
  company: Company | null;
  setCompany: React.Dispatch<React.SetStateAction<Company | null>>;
  socket: Socket | null;
}

const CompanyContext = createContext<CompanyContextType>({
  company: null,
  setCompany: () => {},
  socket: null,
});

export const useCompany = () => useContext(CompanyContext);

interface Props {
  children: ReactNode;
}

export const CompanyProvider: React.FC<Props> = ({ children }) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Connect Socket.io
    const s: Socket = io("http://localhost:5000", { auth: { token } });
    setSocket(s);

    s.on("connect", () => console.log("Socket connected:", s.id));

    // Listen for real-time company updates
    s.on("company:update", (updatedCompany: Company) => {
      setCompany(updatedCompany);
      toast.success("Company profile updated in real-time!");
    });

    s.on("connect_error", (err: Error) =>
      toast.error("Socket connection failed: " + err.message)
    );

    // Cleanup
    return () => {
      s.disconnect();
    };
  }, []);

  // Fetch initial company data
  useEffect(() => {
    const fetchCompany = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("/api/company/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch company profile");
        const data: Company = await res.json();
        setCompany(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch company profile");
      }
    };
    fetchCompany();
  }, []);

  return (
    <CompanyContext.Provider value={{ company, setCompany, socket }}>
      {children}
    </CompanyContext.Provider>
  );
};
