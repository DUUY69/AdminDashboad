// Dữ liệu mẫu - User quán cafe (role: Admin | StoreUser | SupplierUser)
export const usersData = [
  { id: 1, email: "admin@cafe.vn", name: "Admin Cafe", role: "Admin", storeId: null, supplierId: null, status: "Active" },
  { id: 2, email: "q1@cafe.vn", name: "Nguyễn Văn An", role: "StoreUser", storeId: 1, supplierId: null, status: "Active" },
  { id: 3, email: "q7@cafe.vn", name: "Trần Thị Bình", role: "StoreUser", storeId: 2, supplierId: null, status: "Active" },
  { id: 4, email: "bt@cafe.vn", name: "Lê Thị Hương", role: "StoreUser", storeId: 3, supplierId: null, status: "Active" },
  { id: 5, email: "ncc_caphe@supplier.vn", name: "Lê Văn Cường", role: "SupplierUser", storeId: null, supplierId: 1, status: "Active" },
  { id: 6, email: "ncc_sua@supplier.vn", name: "Phạm Thị Dung", role: "SupplierUser", storeId: null, supplierId: 2, status: "Active" },
  { id: 7, email: "ncc_syrup@supplier.vn", name: "Hoàng Văn Em", role: "SupplierUser", storeId: null, supplierId: 3, status: "Active" },
  { id: 8, email: "ncc_banh@supplier.vn", name: "Võ Minh Tuấn", role: "SupplierUser", storeId: null, supplierId: 4, status: "Active" },
  { id: 9, email: "ncc_vattu@supplier.vn", name: "Đặng Thị Lan", role: "SupplierUser", storeId: null, supplierId: 5, status: "Active" },
];
