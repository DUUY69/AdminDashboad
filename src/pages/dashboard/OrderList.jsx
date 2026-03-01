import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Chip,
  IconButton,
  Tooltip,
  Button,
} from "@material-tailwind/react";
import { FilterSelect } from "@/components/FilterSelect";
import { PrinterIcon, FunnelIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context";

const statusColors = { Draft: "gray", Submitted: "blue", Processing: "orange", PartiallyCompleted: "amber", Completed: "green", Cancelled: "red" };

function exportOrderPrint(order, stores) {
  const storeName = stores.find((s) => s.id === order.storeId)?.name || order.storeName;
  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Đơn #${order.id}</title>
  <style>body{font-family:Arial;padding:20px;font-size:14px} table{width:100%;border-collapse:collapse;margin:10px 0} th,td{border:1px solid #ddd;padding:8px;text-align:left} th{background:#f5f5f5} .header{margin-bottom:20px} .section{margin:15px 0}</style></head><body>
  <div class="header"><h2>ĐƠN HÀNG #${order.id}</h2><p><strong>Cửa hàng:</strong> ${storeName} | <strong>Ngày đặt:</strong> ${order.orderDate} | <strong>Trạng thái:</strong> ${order.status}</p></div>`;
  (order.orderSuppliers || []).forEach((os) => {
    html += `<div class="section"><h3>NCC: ${os.supplierName} (${os.status})</h3><table><tr><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th></tr>`;
    (os.orderItems || []).forEach((it) => (html += `<tr><td>${it.productName}</td><td>${it.quantity} ${it.unit}</td><td>${Number(it.price).toLocaleString("vi-VN")} đ</td></tr>`));
    html += `</table><p>Giao dự kiến: ${os.expectedDeliveryDate || "-"} | Giao thực tế: ${os.actualDeliveryDate || "-"}</p></div>`;
  });
  html += "</body></html>";
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); w.focus(); setTimeout(() => { w.print(); w.close(); }, 300); }
}

export function OrderList() {
  const { orders, setOrders, stores, suppliers } = useData();
  const { currentUser, isAdmin, isStoreUser } = useAuth();

  const handleAdminAcceptOrder = (order) => {
    setOrders(orders.map((o) => {
      if (o.id !== order.id) return o;
      const newOrderSuppliers = (o.orderSuppliers || []).map((os) =>
        os.status === "Pending" ? { ...os, status: "Confirmed", confirmDate: new Date().toISOString().slice(0, 10) } : os
      );
      return { ...o, orderSuppliers: newOrderSuppliers, status: "Processing" };
    }));
  };

  const handleAdminRejectOrder = (order) => {
    setOrders(orders.map((o) => {
      if (o.id !== order.id) return o;
      const newOrderSuppliers = (o.orderSuppliers || []).map((os) => ({ ...os, status: "Rejected" }));
      return { ...o, orderSuppliers: newOrderSuppliers, status: "Cancelled" };
    }));
  };
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterStore, setFilterStore] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  let list = orders;
  if (isStoreUser && currentUser?.storeId) list = list.filter((o) => o.storeId === currentUser.storeId);
  if (filterStatus) list = list.filter((o) => o.status === filterStatus);
  if (filterSupplier) {
    const sid = Number(filterSupplier);
    list = list.filter((o) => o.orderSuppliers?.some((os) => os.supplierId === sid));
  }
  if (filterStore) list = list.filter((o) => o.storeId === Number(filterStore));
  if (filterDateFrom) list = list.filter((o) => o.orderDate >= filterDateFrom);
  if (filterDateTo) list = list.filter((o) => o.orderDate <= filterDateTo);

  const hasFilters = filterStatus || filterSupplier || filterStore || filterDateFrom || filterDateTo;
  const clearFilters = () => {
    setFilterStatus("");
    setFilterSupplier("");
    setFilterStore("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  return (
    <div className="mt-12 w-full max-w-full min-w-0">
      <Card className="border border-blue-gray-100 w-full max-w-full">
        <CardHeader className="p-4 pb-5 border-b">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Typography variant="h6" color="blue-gray">Danh sách đơn hàng</Typography>
              {hasFilters && (
                <Button variant="text" size="sm" className="flex items-center gap-1 text-red-600" onClick={clearFilters}>
                  <XMarkIcon className="w-4 h-4" /> Xóa bộ lọc
                </Button>
              )}
            </div>
            <div className="flex flex-row flex-wrap items-end gap-6 w-full">
              <div className="flex items-center gap-1 text-blue-gray-500 shrink-0">
                <FunnelIcon className="w-4 h-4" />
                <Typography variant="small" className="font-medium">Bộ lọc:</Typography>
              </div>
              <div className="w-[172px] shrink-0">
                <FilterSelect label="Trạng thái" value={filterStatus} onChange={setFilterStatus} options={Object.keys(statusColors).map((s) => ({ value: s, label: s }))} placeholder="Tất cả" />
              </div>
              {isAdmin && (
                <div className="w-[172px] shrink-0">
                  <FilterSelect label="Cửa hàng" value={filterStore} onChange={setFilterStore} options={stores.map((s) => ({ value: String(s.id), label: s.name }))} placeholder="Tất cả" />
                </div>
              )}
              {isAdmin && (
                <div className="w-[172px] shrink-0">
                  <FilterSelect label="NCC" value={filterSupplier} onChange={setFilterSupplier} options={suppliers.map((s) => ({ value: String(s.id), label: s.name }))} placeholder="Tất cả" />
                </div>
              )}
              <div className="w-[172px] shrink-0">
                <Input type="date" label="Từ ngày" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="!min-w-0" />
              </div>
              <div className="w-[172px] shrink-0">
                <Input type="date" label="Đến ngày" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="!min-w-0" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto p-0">
          <div className="px-4 py-2 border-b border-blue-gray-50 flex justify-between items-center">
            <Typography variant="small" color="gray">Hiển thị <strong>{list.length}</strong> đơn</Typography>
          </div>
          <table className="w-full table-fixed" style={{ tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th className="border-b border-blue-gray-50 py-3 px-3 text-left w-14"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">ID</Typography></th>
                <th className="border-b border-blue-gray-50 py-3 px-3 text-left w-24"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">Tên đơn</Typography></th>
                <th className="border-b border-blue-gray-50 py-3 px-3 text-left"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">Tên cửa hàng</Typography></th>
                <th className="border-b border-blue-gray-50 py-3 px-3 text-left w-28"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">Ngày</Typography></th>
                <th className="border-b border-blue-gray-50 py-3 px-3 text-left w-32"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">Trạng thái</Typography></th>
                <th className="border-b border-blue-gray-50 py-3 px-3 text-left w-40"><Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">Thao tác</Typography></th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Typography color="gray">Không có đơn nào thỏa bộ lọc. Thử xóa bộ lọc hoặc tạo đơn mới.</Typography>
                  </td>
                </tr>
              ) : list.map((row) => (
                <tr key={row.id} className="hover:bg-blue-gray-50/50 align-baseline">
                  <td className="py-3 px-3 border-b border-blue-gray-50 align-middle"><Typography variant="small" className="font-medium">#{row.id}</Typography></td>
                  <td className="py-3 px-3 border-b border-blue-gray-50 align-middle"><Typography variant="small">Đơn #{row.id}</Typography></td>
                  <td className="py-3 px-3 border-b border-blue-gray-50 align-middle min-w-0"><Typography variant="small" className="truncate block" title={row.storeName}>{row.storeName}</Typography></td>
                  <td className="py-3 px-3 border-b border-blue-gray-50 align-middle whitespace-nowrap"><Typography variant="small">{row.orderDate}</Typography></td>
                  <td className="py-3 px-3 border-b border-blue-gray-50 align-middle">
                    {isAdmin && row.status === "Submitted" ? (
                      <select
                        value=""
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "accept") handleAdminAcceptOrder(row);
                          else if (v === "reject") handleAdminRejectOrder(row);
                          e.target.value = "";
                        }}
                        className="w-full max-w-[140px] rounded-lg border border-blue-gray-200 bg-white px-2 py-1.5 text-sm text-blue-gray-700 outline-none focus:border-blue-500"
                      >
                        <option value="">Trạng thái: Submitted</option>
                        <option value="accept">Chấp nhận</option>
                        <option value="reject">Từ chối</option>
                      </select>
                    ) : (
                      <Chip size="sm" color={statusColors[row.status] || "gray"} value={row.status} className="w-fit max-w-full truncate" />
                    )}
                  </td>
                  <td className="py-3 px-3 border-b border-blue-gray-50 align-middle">
                    <div className="flex flex-wrap items-center gap-x-2">
                      <Typography as="a" href="#" className="text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap shrink-0" onClick={(e) => { e.preventDefault(); navigate(`/dashboard/orders/${row.id}`); }}>
                        Xem / Theo dõi
                      </Typography>
                      <span className="text-blue-gray-300 shrink-0">|</span>
                      <Tooltip content="Xuất đơn / In">
                        <IconButton variant="text" size="sm" className="shrink-0" onClick={() => exportOrderPrint(row, stores)}>
                          <PrinterIcon className="w-4 h-4" />
                        </IconButton>
                      </Tooltip>
                    </div>
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

export default OrderList;
