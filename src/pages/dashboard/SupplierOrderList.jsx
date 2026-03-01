import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardBody, Typography, Chip, Input, Button } from "@material-tailwind/react";
import { FilterSelect } from "@/components/FilterSelect";
import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context";

const statusColors = { Pending: "gray", Confirmed: "blue", Partial: "amber", Rejected: "red", Delivering: "orange", Delivered: "teal", Completed: "green" };

export function SupplierOrderList() {
  const { orders } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const supplierId = currentUser?.supplierId;
  let list = orders.flatMap((o) => (o.orderSuppliers || []).map((os) => ({ ...os, order: o }))).filter((os) => os.supplierId === supplierId);
  if (filterStatus) list = list.filter((os) => os.status === filterStatus);
  if (filterDateFrom) list = list.filter((os) => (os.order?.orderDate || "") >= filterDateFrom);
  if (filterDateTo) list = list.filter((os) => (os.order?.orderDate || "") <= filterDateTo);
  const filtered = list;

  const hasFilters = filterStatus || filterDateFrom || filterDateTo;
  const clearFilters = () => { setFilterStatus(""); setFilterDateFrom(""); setFilterDateTo(""); };

  return (
    <div className="mt-12">
      <Card className="border border-blue-gray-100">
        <CardHeader className="p-4 border-b">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Typography variant="h6" color="blue-gray">Đơn cần xử lý (NCC của tôi)</Typography>
              {hasFilters && (
                <Button variant="text" size="sm" className="flex items-center gap-1 text-red-600" onClick={clearFilters}>
                  <XMarkIcon className="w-4 h-4" /> Xóa bộ lọc
                </Button>
              )}
            </div>
            <div className="flex flex-row flex-wrap items-end gap-4 w-full">
              <div className="flex items-center gap-1 text-blue-gray-500 shrink-0">
                <FunnelIcon className="w-4 h-4" />
                <Typography variant="small" className="font-medium">Bộ lọc:</Typography>
              </div>
              <div className="w-[160px] shrink-0">
                <FilterSelect label="Trạng thái" value={filterStatus} onChange={setFilterStatus} options={Object.keys(statusColors).map((s) => ({ value: s, label: s }))} placeholder="Tất cả" />
              </div>
              <div className="w-[150px] shrink-0 mr-4">
                <Input type="date" label="Từ ngày đặt" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="!min-w-0" />
              </div>
              <div className="w-[150px] shrink-0">
                <Input type="date" label="Đến ngày đặt" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="!min-w-0" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">ID đơn con</Typography></th>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">Đơn tổng #</Typography></th>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">Cửa hàng</Typography></th>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">Trạng thái</Typography></th>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">Thao tác</Typography></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((os) => (
                <tr key={os.id}>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Typography variant="small">{os.id}</Typography></td>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Typography variant="small">#{os.orderId}</Typography></td>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Typography variant="small">{os.order?.storeName}</Typography></td>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Chip size="sm" color={statusColors[os.status] || "gray"} value={os.status} /></td>
                  <td className="py-3 px-4 border-b border-blue-gray-50">
                    <Typography as="a" href="#" className="text-xs font-semibold text-blue-600" onClick={(e) => { e.preventDefault(); navigate(`/dashboard/supplier-orders/${os.id}`); }}>
                      Xem / Xử lý
                    </Typography>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

export default SupplierOrderList;
