import React, { useState } from "react";
import { Card, CardHeader, CardBody, Typography, Button, Input, IconButton, Chip } from "@material-tailwind/react";
import { FilterSelect } from "@/components/FilterSelect";
import { PencilIcon, TrashIcon, PlusIcon, FunnelIcon } from "@heroicons/react/24/solid";
import { useData } from "@/context/DataContext";

export function Suppliers() {
  const { suppliers, setSuppliers } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ code: "", name: "", contact: "", email: "", address: "", status: "Active" });
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filteredSuppliers = suppliers.filter((s) => {
    const matchSearch = !filterSearch || [s.code, s.name, s.email].some((v) => String(v || "").toLowerCase().includes(filterSearch.toLowerCase()));
    const matchStatus = !filterStatus || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ code: "", name: "", contact: "", email: "", address: "", status: "Active" });
    setOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setForm({ ...row });
    setOpen(true);
  };
  const handleSave = () => {
    if (editing) {
      setSuppliers(suppliers.map((s) => (s.id === editing.id ? { ...editing, ...form } : s)));
    } else {
      const newId = Math.max(0, ...suppliers.map((s) => s.id)) + 1;
      setSuppliers([...suppliers, { id: newId, ...form }]);
    }
    setOpen(false);
  };
  const handleDelete = (id) => {
    if (window.confirm("Xóa nhà cung cấp này?")) setSuppliers(suppliers.filter((s) => s.id !== id));
  };

  return (
    <div className="mt-12">
      <Card className="border border-blue-gray-100">
        <CardHeader className="p-4 border-b">
          <div className="flex flex-col gap-4">
            <div className="flex flex-row flex-wrap items-center justify-between gap-2">
              <Typography variant="h6" color="blue-gray">Quản lý Nhà cung cấp</Typography>
              <Button size="sm" className="flex items-center gap-1" onClick={openAdd}>
                <PlusIcon className="w-4 h-4" /> Thêm
              </Button>
            </div>
            <div className="flex flex-row flex-wrap items-end gap-4 w-full">
              <div className="flex items-center gap-1 text-blue-gray-500 shrink-0">
                <FunnelIcon className="w-4 h-4" />
                <Typography variant="small" className="font-medium">Bộ lọc:</Typography>
              </div>
              <div className="w-[220px] shrink-0">
                <Input placeholder="Tìm mã, tên, email..." value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} className="!min-w-0" />
              </div>
              <div className="w-[140px] shrink-0">
                <FilterSelect label="Trạng thái" value={filterStatus} onChange={setFilterStatus} options={[{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }]} placeholder="Tất cả" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Mã", "Tên", "Liên hệ", "Email", "Địa chỉ", "Trạng thái", "Thao tác"].map((el) => (
                  <th key={el} className="border-b border-blue-gray-50 py-3 px-4 text-left">
                    <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">{el}</Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((row) => (
                <tr key={row.id}>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Typography variant="small">{row.code}</Typography></td>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Typography variant="small">{row.name}</Typography></td>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Typography variant="small">{row.contact}</Typography></td>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Typography variant="small">{row.email}</Typography></td>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Typography variant="small">{row.address}</Typography></td>
                  <td className="py-3 px-4 border-b border-blue-gray-50">
                    <Chip size="sm" color={row.status === "Active" ? "green" : "gray"} value={row.status} />
                  </td>
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
            <CardHeader className="pb-2">{editing ? "Sửa Nhà cung cấp" : "Thêm Nhà cung cấp"}</CardHeader>
            <CardBody className="flex flex-col gap-3">
              <Input label="Mã" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              <Input label="Tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="Liên hệ" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
              <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Địa chỉ" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
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

export default Suppliers;
