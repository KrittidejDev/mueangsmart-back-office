import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export interface SuperAdminUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role_name: string;
  is_active: boolean;
  created_date: string;
}

export interface Role {
  Id: string;
  Name: string;
  Description: string;
}

export function useSuperAdmins() {
  const [users, setUsers] = useState<SuperAdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  async function fetchUsersAndRoles() {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        api.get("/super-admins"),
        api.get("/roles"),
      ]);
      setUsers(usersRes.data || []);
      setRoles(rolesRes.data || []);
    } catch (err: unknown) {
      console.error("Failed to fetch users or roles:", err);
      const errorMsg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to load data";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function createUser(data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    role_id: string;
  }) {
    setCreating(true);
    setError(null);
    try {
      await api.post("/super-admins", data);
      await fetchUsersAndRoles();
      return true;
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to create user";
      setError(errorMsg);
      return false;
    } finally {
      setCreating(false);
    }
  }

  async function deleteUser(id: string) {
    setDeleting(true);
    setError(null);
    try {
      await api.delete(`/super-admins/${id}`);
      await fetchUsersAndRoles();
      return true;
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to delete user";
      setError(errorMsg);
      return false;
    } finally {
      setDeleting(false);
    }
  }

  return {
    users,
    roles,
    loading,
    creating,
    deleting,
    error,
    createUser,
    deleteUser,
    refetch: fetchUsersAndRoles,
  };
}
