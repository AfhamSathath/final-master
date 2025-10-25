import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react"; // Eye icons

// ========================
// Types
// ========================
type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  contactNumber?: string;
  location?: string;
  regNumber?: string;
};

type FormData = {
  name: string;
  email: string;
  password?: string;
  role: string;
  contactNumber?: string;
  location?: string;
  regNumber?: string;
};

// ========================
// Axios
// ========================
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ========================
// Endpoint Helper
// ========================
const getEndpoint = (role: string, action: "fetch" | "register" = "fetch") => {
  if (action === "register") {
    switch (role) {
      case "company":
        return "/register/company";
      case "user":
        return "/register/user";
      default:
        return "/register/admin";
    }
  }

  switch (role) {
    case "company":
      return "/companies";
    case "admin":
      return "/admins";
    default:
      return "/users";
  }
};

// ========================
// Component
// ========================
const Users: React.FC = () => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    role: "user",
    contactNumber: "",
    location: "",
    regNumber: "",
  });

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false); // toggle for password

  // ========================
  // Fetch Data
  // ========================
  const {
    data: users = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<User[], Error>({
    queryKey: ["users", formData.role],
    queryFn: async () => {
      const res = await api.get<User[]>(getEndpoint(formData.role));
      return res.data;
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 2000,
  });

  useEffect(() => {
    refetch();
  }, [formData.role, refetch]);

  // ========================
  // Mutations
  // ========================
  const createMutation = useMutation({
    mutationFn: async (data: FormData) =>
      (await api.post(getEndpoint(data.role, "register"), data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", formData.role] });
      toast.success(`${formData.role} created successfully!`);
      resetForm();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Error"),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: User & FormData) =>
      (await api.put(`${getEndpoint(data.role)}/${data._id}`, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", formData.role] });
      toast.success(`${formData.role} updated successfully!`);
      resetForm();
      setEditingUser(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Error"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (user: User) => api.delete(`${getEndpoint(user.role)}/${user._id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", formData.role] });
      toast.success(`${formData.role} deleted successfully`);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Error"),
  });

  // ========================
  // Handlers
  // ========================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.role === "company" && !formData.regNumber) {
      return toast.error("Company must have a registration number");
    }
    if (editingUser) updateMutation.mutate({ ...editingUser, ...formData });
    else createMutation.mutate(formData);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      contactNumber: user.contactNumber || "",
      location: user.location || "",
      regNumber: user.regNumber || "",
    });
    setShowPassword(false);
  };

  const handleDelete = (user: User) => {
    if (window.confirm(`Are you sure you want to delete this ${user.role}?`))
      deleteMutation.mutate(user);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
      contactNumber: "",
      location: "",
      regNumber: "",
    });
    setEditingUser(null);
    setShowPassword(false);
  };

  // ========================
  // UI
  // ========================
  if (isLoading) return <p>Loading {formData.role}s...</p>;
  if (isError) return <p>Error fetching {formData.role}s.</p>;

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-4">Role-Based Management (Auto Refresh)</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded shadow mb-6">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            required
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            required
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="p-2 border rounded"
          />

          {/* Password Field with Eye Toggle */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              required={!editingUser}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="p-2 border rounded w-full"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          <select
            value={formData.role}
            onChange={(e) =>
              setFormData({
                ...formData,
                role: e.target.value,
                contactNumber: "",
                location: "",
                regNumber: "",
              })
            }
            className="p-2 border rounded"
          >
            <option value="user">User</option>
            <option value="company">Company</option>
            <option value="admin">Admin</option>
          </select>

          {(formData.role === "user" || formData.role === "company") && (
            <input
              type="text"
              placeholder="Contact"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              className="p-2 border rounded"
            />
          )}

          {formData.role === "company" && (
            <>
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Registration Number"
                value={formData.regNumber}
                required
                onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                className="p-2 border rounded"
              />
            </>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingUser ? "Update" : "Create"} {formData.role}
          </button>
          {editingUser && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <table className="w-full border border-gray-300 rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            {formData.role !== "admin" && <th className="p-2 text-left">Contact</th>}
            {formData.role === "company" && <th className="p-2 text-left">Location</th>}
            {formData.role === "company" && <th className="p-2 text-left">Reg Number</th>}
            <th className="p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center p-4 text-gray-500">
                No records found.
              </td>
            </tr>
          )}
          {users.map((user) => (
            <tr key={user._id} className="border-t hover:bg-gray-50">
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.role}</td>
              {formData.role !== "admin" && <td className="p-2">{user.contactNumber || "-"}</td>}
              {formData.role === "company" && <td className="p-2">{user.location || "-"}</td>}
              {formData.role === "company" && <td className="p-2">{user.regNumber || "-"}</td>}
              <td className="p-2 text-center">
                <button
                  onClick={() => handleEdit(user)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(user)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
