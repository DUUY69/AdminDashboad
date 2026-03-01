import React from "react";
import {
  suppliersData,
  categoriesData,
  productsData,
  storesData,
  usersData,
  ordersData as initialOrders,
} from "@/data";

const DataContext = React.createContext(null);

export function DataProvider({ children }) {
  const [suppliers, setSuppliers] = React.useState([...suppliersData]);
  const [categories, setCategories] = React.useState([...categoriesData]);
  const [products, setProducts] = React.useState([...productsData]);
  const [stores, setStores] = React.useState([...storesData]);
  const [users, setUsers] = React.useState([...usersData]);
  const [orders, setOrders] = React.useState(() => JSON.parse(JSON.stringify(initialOrders)));

  const value = React.useMemo(
    () => ({
      suppliers,
      setSuppliers,
      categories,
      setCategories,
      products,
      setProducts,
      stores,
      setStores,
      users,
      setUsers,
      orders,
      setOrders,
    }),
    [suppliers, categories, products, stores, users, orders]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = React.useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
