import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardBody, Typography, Button, Chip } from "@material-tailwind/react";
import { ArrowLeftIcon, CheckIcon, XMarkIcon, TruckIcon } from "@heroicons/react/24/solid";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context";

export function SupplierOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, setOrders } = useData();
  const { currentUser } = useAuth();

  const osId = Number(id);
  let found = null;
  let orderIndex = -1;
  let osIndex = -1;
  for (let i = 0; i < orders.length; i++) {
    const idx = (orders[i].orderSuppliers || []).findIndex((os) => os.id === osId);
    if (idx >= 0) {
      found = orders[i].orderSuppliers[idx];
      orderIndex = i;
      osIndex = idx;
      break;
    }
  }

  if (!found || found.supplierId !== currentUser?.supplierId) {
    return (
      <div className="mt-12">
        <Typography>Không tìm thấy đơn hoặc không có quyền.</Typography>
        <Button className="mt-2" onClick={() => navigate("/dashboard/supplier-orders")}>Quay lại</Button>
      </div>
    );
  }

  const updateStatus = (newStatus) => {
    const next = orders.map((o, i) => {
      if (i !== orderIndex) return o;
      return {
        ...o,
        orderSuppliers: o.orderSuppliers.map((os, j) => {
          if (j !== osIndex) return os;
          const updated = { ...os, status: newStatus };
          if (newStatus === "Confirmed") updated.confirmDate = new Date().toISOString().slice(0, 10);
          if (newStatus === "Delivered") updated.actualDeliveryDate = new Date().toISOString().slice(0, 10);
          return updated;
        }),
      };
    });
    setOrders(next);
  };

  const canConfirm = found.status === "Pending";
  const canReject = found.status === "Pending";
  const canPartial = found.status === "Confirmed" || found.status === "Delivering";
  const canDelivering = found.status === "Confirmed";
  const canDelivered = found.status === "Delivering";

  return (
    <div className="mt-12">
      <Button variant="text" className="flex items-center gap-1 mb-4" onClick={() => navigate("/dashboard/supplier-orders")}>
        <ArrowLeftIcon className="w-4 h-4" /> Quay lại
      </Button>
      <Card className="border border-blue-gray-100 mb-6">
        <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
          <Typography variant="h5">Đơn NCC #{found.id}</Typography>
          <Chip color={found.status === "Completed" ? "green" : found.status === "Pending" ? "gray" : "blue"} value={found.status} />
        </CardHeader>
        <CardBody className="p-4">
          <table className="w-full table-auto mb-4">
            <thead>
              <tr>
                <th className="text-left py-2"><Typography variant="small" className="font-bold text-blue-gray-500">Sản phẩm</Typography></th>
                <th className="text-left py-2"><Typography variant="small" className="font-bold text-blue-gray-500">Số lượng</Typography></th>
                <th className="text-left py-2"><Typography variant="small" className="font-bold text-blue-gray-500">Đơn giá</Typography></th>
              </tr>
            </thead>
            <tbody>
              {(found.orderItems || []).map((item) => (
                <tr key={item.id}>
                  <td className="py-2"><Typography variant="small">{item.productName}</Typography></td>
                  <td className="py-2"><Typography variant="small">{item.quantity} {item.unit}</Typography></td>
                  <td className="py-2"><Typography variant="small">{Number(item.price).toLocaleString("vi-VN")} đ</Typography></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-wrap gap-2">
            {canConfirm && <Button size="sm" color="green" className="flex items-center gap-1" onClick={() => updateStatus("Confirmed")}><CheckIcon className="w-4 h-4" /> Confirm</Button>}
            {canReject && <Button size="sm" color="red" className="flex items-center gap-1" onClick={() => updateStatus("Rejected")}><XMarkIcon className="w-4 h-4" /> Reject</Button>}
            {canPartial && <Button size="sm" color="amber" onClick={() => updateStatus("Partial")}>Báo giao thiếu (Partial)</Button>}
            {canDelivering && <Button size="sm" color="orange" className="flex items-center gap-1" onClick={() => updateStatus("Delivering")}><TruckIcon className="w-4 h-4" /> Đang giao</Button>}
            {canDelivered && <Button size="sm" color="teal" onClick={() => updateStatus("Delivered")}>Đã giao (Delivered)</Button>}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default SupplierOrderDetail;
