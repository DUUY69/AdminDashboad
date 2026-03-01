import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  IconButton,
} from "@material-tailwind/react";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/solid";
import { useData } from "@/context/DataContext";

export function Categories() {
  const { categories, setCategories } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", description: "" });
    setOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name, description: row.description || "" });
    setOpen(true);
  };
  const handleSave = () => {
    if (editing) {
      setCategories(categories.map((c) => (c.id === editing.id ? { ...editing, ...form } : c)));
    } else {
      const newId = Math.max(0, ...categories.map((c) => c.id)) + 1;
      setCategories([...categories, { id: newId, ...form }]);
    }
    setOpen(false);
  };
  const handleDelete = (id) => {
    if (window.confirm("Xóa danh mục này?")) setCategories(categories.filter((c) => c.id !== id));
  };

  return (
    <div className="mt-12">
      <Card className="border border-blue-gray-100">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <Typography variant="h6" color="blue-gray">Quản lý Danh mục</Typography>
          <Button size="sm" className="flex items-center gap-1" onClick={openAdd}>
            <PlusIcon className="w-4 h-4" /> Thêm
          </Button>
        </CardHeader>
        <CardBody className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">ID</Typography></th>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">Tên</Typography></th>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">Mô tả</Typography></th>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">Thao tác</Typography></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((row) => (
                <tr key={row.id}>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Typography variant="small">{row.id}</Typography></td>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Typography variant="small">{row.name}</Typography></td>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Typography variant="small">{row.description}</Typography></td>
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
            <CardHeader className="pb-2">{editing ? "Sửa Danh mục" : "Thêm Danh mục"}</CardHeader>
            <CardBody className="flex flex-col gap-3">
              <Input label="Tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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

export default Categories;
