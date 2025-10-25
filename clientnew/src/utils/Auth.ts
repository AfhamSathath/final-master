// frontend/src/utils/Auth.ts

// ========================
// 🔒 TYPES
// ========================
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role?: string;
  [key: string]: any;
}

export interface ICompany {
  _id: string;
  name: string;
  [key: string]: any;
}

export interface ICourse {
  _id: string;
  title: string;
  description?: string;
  [key: string]: any;
}

export interface IJob {
  _id: string;
  title: string;
  description?: string;
  [key: string]: any;
}

// ========================
// 🔒 LOCAL STORAGE HELPERS
// ========================
const setItem = (key: string, value: any) => localStorage.setItem(key, JSON.stringify(value));
const getItem = <T>(key: string): T | null => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};
const removeItem = (key: string) => localStorage.removeItem(key);

// ========================
// 🔑 TOKEN MANAGEMENT
// ========================
export const setToken = (token: string) => localStorage.setItem("token", token);
export const getToken = (): string | null => localStorage.getItem("token");
export const removeToken = () => localStorage.removeItem("token");

// ========================
// 👤 USER MANAGEMENT
// ========================
export const setUser = (user: IUser) => setItem("user", user);
export const getUser = (): IUser | null => getItem<IUser>("user");
export const removeUser = () => removeItem("user");

// ========================
// 🏢 COMPANY MANAGEMENT
// ========================
export const setCompany = (company: ICompany) => setItem("company", company);
export const getCompany = (): ICompany | null => getItem<ICompany>("company");
export const removeCompany = () => removeItem("company");

// ========================
// 🎓 COURSE MANAGEMENT
// ========================
export const setCourse = (course: ICourse) => setItem("course", course);
export const getCourse = (): ICourse | null => getItem<ICourse>("course");
export const removeCourse = () => removeItem("course");

// ========================
// 💼 JOB MANAGEMENT
// ========================
export const setJob = (job: IJob) => setItem("job", job);
export const getJob = (): IJob | null => getItem<IJob>("job");
export const removeJob = () => removeItem("job");

// ========================
// ✅ AUTHENTICATION HELPERS
// ========================
export const isAuthenticated = (): boolean => !!getToken() && !!getUser();

export const logout = () => {
  removeToken();
  removeUser();
  removeCompany();
  removeCourse();
  removeJob();
};

// ========================
// 🌐 API HELPERS
// ========================
const API_BASE = "http://localhost:5000";

export const fetchCurrentUser = async (): Promise<IUser> => {
  const token = getToken();
  if (!token) throw new Error("No token found");

  const response = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Failed to fetch user");

  return response.json();
};

// ========================
// 🔄 GENERIC UPDATE HELPERS
// ========================
const updateItem = <T>(key: string, updatedData: Partial<T>): T | null => {
  const current = getItem<T>(key);
  if (!current) return null;
  const newItem = { ...current, ...updatedData };
  setItem(key, newItem);
  return newItem;
};

export const updateUser = (data: Partial<IUser>) => updateItem<IUser>("user", data);
export const updateCompany = (data: Partial<ICompany>) => updateItem<ICompany>("company", data);
export const updateCourse = (data: Partial<ICourse>) => updateItem<ICourse>("course", data);
export const updateJob = (data: Partial<IJob>) => updateItem<IJob>("job", data);
