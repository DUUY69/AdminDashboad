import React from "react";
import { usersData } from "@/data";
import { storesData, suppliersData } from "@/data";

const STORAGE_KEY = "multi_supplier_current_user";

const defaultUser = usersData[0]; // Admin Cafe

function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const found = usersData.find((u) => u.id === parsed.id);
    return found || null;
  } catch {
    return null;
  }
}

export const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = React.useState(() => getStoredUser() || defaultUser);

  const login = React.useCallback((user) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: user.id }));
  }, []);

  const logout = React.useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isAdmin = currentUser?.role === "Admin";
  const isStoreUser = currentUser?.role === "StoreUser";
  const isSupplierUser = currentUser?.role === "SupplierUser";

  const storeName = currentUser?.storeId
    ? storesData.find((s) => s.id === currentUser.storeId)?.name
    : null;
  const supplierName = currentUser?.supplierId
    ? suppliersData.find((s) => s.id === currentUser.supplierId)?.name
    : null;

  const value = React.useMemo(
    () => ({
      currentUser,
      login,
      logout,
      isAdmin,
      isStoreUser,
      isSupplierUser,
      storeName,
      supplierName,
    }),
    [currentUser, login, logout, isAdmin, isStoreUser, isSupplierUser, storeName, supplierName]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
