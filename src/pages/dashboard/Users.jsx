import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  IconButton,
  Chip,
  Select,
  Option,
} from "@material-tailwind/react";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/solid";
import { useData } from "@/context/DataContext";

const ROLES = ["Admin", "StoreUser", "SupplierUser"];

export function Users() {
  const { users, setUsers, stores, suppliers } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ email: "", name: "", role: "StoreUser", storeId: null, supplierId: null, status: "Active" });

  const openAdd = () => {
    setEditing(null);
    setForm({ email: "", name: "", role: "StoreUser", storeId: stores[0]?.id || null, supplierId: null, status: "Active" });
    setOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setForm({ email: row.email, name: row.name, role: row.role, storeId: row.storeId, supplierId: row.supplierId, status: row.status });
    setOpen(true);
  };
  const handleSave = () => {
    if (editing) {
      setUsers(users.map((u) => (u.id === editing.id ? { ...editing, ...form } : u)));
    } else {
      const newId = Math.max(0, ...users.map((u) => u.id)) + 1;
      setUsers([...users, { id: newId, ...form }]);
    }
    setOpen(false);
  };
  const handleDelete = (id) => {
    if (window.confirm("Xóa user này?")) setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="mt-12">
      <Card className="border border-blue-gray-100">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <Typography variant="h6" color="blue-gray">Quản lý User</Typography>
          <Button size="sm" className="flex items-center gap-1" onClick={openAdd}>
            <PlusIcon className="w-4 h-4" /> Thêm
          </Button>
        </CardHeader>
        <CardBody className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Email", "Tên", "Role", "Store/NCC", "Trạng thái", "Thao tác"].map((el) => (
                  <th key={el} className="border-b border-blue-gray-50 py-3 px-4 text-left">
                    <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">{el}</Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((row) => (
                <tr key={row.id}>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Typography variant="small">{row.email}</Typography></td>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Typography variant="small">{row.name}</Typography></td>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Chip size="sm" color="blue" value={row.role} /></td>
                  <td className="py-3 px-4 border-b border-blue-gray-50">
                    <Typography variant="small">
                      {row.storeId ? stores.find((s) => s.id === row.storeId)?.name : row.supplierId ? suppliers.find((s) => s.id === row.supplierId)?.name : "-"}
                    </Typography>
                  </td>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Chip size="sm" color={row.status === "Active" ? "green" : "gray"} value={row.status} /></td>
                  <td className="py-3 px-4 border-b border-blue-gray-50 flex gap-1">
                    <IconButton variant="text" size="sm" onClick={() => openEdit(row)}><PencilIcon className="w-4 h-4" /></IconButton>
                    <IconButton variant="text" size="sm" color="red" onClick={() => handleDelete(row.id)}><TrashIcon className="w-4 h-4" /></IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="pb-2">{editing ? "Sửa User" : "Thêm User"}</CardHeader>
            <CardBody className="flex flex-col gap-3">
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Select label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v, storeId: v === "StoreUser" ? stores[0]?.id : null, supplierId: v === "SupplierUser" ? suppliers[0]?.id : null })}>
                {ROLES.map((r) => (<Option key={r} value={r}>{r}</Option>))}
              </Select>
              {form.role === "StoreUser" && (
                <Select label="Cửa hàng" value={String(form.storeId || "")} onChange={(v) => setForm({ ...form, storeId: v ? Number(v) : null })}>
                  {stores.map((s) => (<Option key={s.id} value={String(s.id)}>{s.name}</Option>))}
                </Select>
              )}
              {form.role === "SupplierUser" && (
                <Select label="Nhà cung cấp" value={String(form.supplierId || "")} onChange={(v) => setForm({ ...form, supplierId: v ? Number(v) : null })}>
                  {suppliers.map((s) => (<Option key={s.id} value={String(s.id)}>{s.name}</Option>))}
                </Select>
              )}
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outlined" onClick={() => setOpen(false)}>Hủy</Button>
                <Button onClick={handleSave}>Lưu</Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Users;
