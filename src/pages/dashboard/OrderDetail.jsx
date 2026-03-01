import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardBody, Typography, Button, Chip } from "@material-tailwind/react";
import { ArrowLeftIcon, PrinterIcon, CheckCircleIcon, PhotoIcon, DocumentTextIcon, DocumentArrowDownIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context";

const osStatusColors = {
  Pending: "gray",
  Confirmed: "blue",
  Partial: "amber",
  Rejected: "red",
  Delivering: "orange",
  Delivered: "teal",
  Completed: "green",
};

const ORDER_STEPS = ["Draft", "Submitted", "Processing", "PartiallyCompleted", "Completed"];
const OS_STEPS = ["Pending", "Confirmed", "Delivering", "Delivered", "Completed"];

function OrderTimeline({ currentStatus, createdDate, orderDate }) {
  const currentIndex = ORDER_STEPS.indexOf(currentStatus);
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {ORDER_STEPS.map((step, i) => {
        const active = i <= currentIndex;
        return (
          <div key={step} className="flex items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                active ? "bg-blue-500 text-white" : "bg-blue-gray-100 text-blue-gray-500"
              }`}
            >
              {active ? <CheckCircleIcon className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs ${active ? "text-blue-gray-800 font-medium" : "text-blue-gray-400"}`}>
              {step}
            </span>
            {i < ORDER_STEPS.length - 1 && <span className="text-blue-gray-300">→</span>}
          </div>
        );
      })}
      {(createdDate || orderDate) && (
        <Typography variant="small" color="gray" className="ml-2">
          Đặt: {orderDate || createdDate?.slice(0, 10)}
        </Typography>
      )}
    </div>
  );
}

function OrderSupplierTimeline({ os }) {
  const steps = os.status === "Rejected" || os.status === "Partial" ? [...OS_STEPS.slice(0, 2), os.status] : OS_STEPS;
  const currentIndex = steps.indexOf(os.status);
  return (
    <div className="flex flex-wrap gap-2 items-center mt-2">
      {steps.map((step, i) => {
        const active = currentIndex >= 0 && i <= currentIndex;
        return (
          <div key={step} className="flex items-center gap-1">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                active ? "bg-teal-500 text-white" : "bg-blue-gray-100 text-blue-gray-500"
              }`}
            >
              {active ? "✓" : i + 1}
            </div>
            <span className={`text-[10px] ${active ? "text-blue-gray-800" : "text-blue-gray-400"}`}>{step}</span>
            {i < steps.length - 1 && <span className="text-blue-gray-300 text-xs">→</span>}
          </div>
        );
      })}
      {os.confirmDate && <span className="text-[10px] text-gray-500 ml-1">Confirm: {os.confirmDate}</span>}
      {os.actualDeliveryDate && <span className="text-[10px] text-gray-500 ml-1">Giao: {os.actualDeliveryDate}</span>}
    </div>
  );
}

function readFilesAsDataUrl(files) {
  return Promise.all(
    Array.from(files || []).map(
      (file) =>
        new Promise((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve({ dataUrl: r.result, fileName: file.name });
          r.readAsDataURL(file);
        })
    )
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, setOrders, stores } = useData();
  const { currentUser, isAdmin, isStoreUser } = useAuth();

  const [confirmModal, setConfirmModal] = useState({ open: false, osId: null });
  const [lightbox, setLightbox] = useState(null);
  const refReceived = useRef(null);
  const refInvoice = useRef(null);

  const orderIndex = orders.findIndex((o) => o.id === Number(id));
  const order = orderIndex >= 0 ? orders[orderIndex] : null;

  const canConfirmReceive = (os) => os.status === "Delivered";

  // Admin chấp nhận hoặc từ chối đơn khi đơn đang Submitted
  const canAdminAcceptOrRejectOrder = order && order.status === "Submitted";

  const handleAdminAcceptOrder = () => {
    const next = orders.map((o) => {
      if (o.id !== order.id) return o;
      const newOrderSuppliers = (o.orderSuppliers || []).map((os) =>
        os.status === "Pending" ? { ...os, status: "Confirmed", confirmDate: new Date().toISOString().slice(0, 10) } : os
      );
      return { ...o, orderSuppliers: newOrderSuppliers, status: "Processing" };
    });
    setOrders(next);
  };

  const handleAdminRejectOrder = () => {
    const next = orders.map((o) => {
      if (o.id !== order.id) return o;
      const newOrderSuppliers = (o.orderSuppliers || []).map((os) => ({ ...os, status: "Rejected" }));
      return { ...o, orderSuppliers: newOrderSuppliers, status: "Cancelled" };
    });
    setOrders(next);
  };

  // Admin chấp nhận đơn tổng (đóng đơn) khi tất cả NCC đã Delivered hoặc Completed
  const canAdminConfirmOrder = order && order.status === "Processing" && (order.orderSuppliers || []).length > 0
    && (order.orderSuppliers || []).every((os) => os.status === "Delivered" || os.status === "Completed" || os.status === "Rejected");

  const handleAdminConfirmOrder = () => {
    const next = orders.map((o) => {
      if (o.id !== order.id) return o;
      const newOrderSuppliers = (o.orderSuppliers || []).map((os) =>
        os.status === "Delivered" ? { ...os, status: "Completed", actualDeliveryDate: os.actualDeliveryDate || new Date().toISOString().slice(0, 10) } : os
      );
      return { ...o, orderSuppliers: newOrderSuppliers, status: "Completed" };
    });
    setOrders(next);
  };

  const openConfirmModal = (osId) => {
    setConfirmModal({ open: true, osId });
    setTimeout(() => { refReceived.current && (refReceived.current.value = ""); refInvoice.current && (refInvoice.current.value = ""); }, 0);
  };

  const handleConfirmReceiveWithImages = async () => {
    const { osId } = confirmModal;
    const receivedFiles = refReceived.current?.files ? Array.from(refReceived.current.files) : [];
    const invoiceFiles = refInvoice.current?.files ? Array.from(refInvoice.current.files) : [];
    const received = await readFilesAsDataUrl(receivedFiles);
    const invoice = await readFilesAsDataUrl(invoiceFiles);
    const receiveImages = [
      ...received.map((r, i) => ({ id: `r-${osId}-${i}`, type: "received", dataUrl: r.dataUrl, fileName: r.fileName })),
      ...invoice.map((r, i) => ({ id: `i-${osId}-${i}`, type: "invoice", dataUrl: r.dataUrl, fileName: r.fileName })),
    ];
    const next = orders.map((o) => {
      if (o.id !== order.id) return o;
      const newOrderSuppliers = o.orderSuppliers.map((os) =>
        os.id === osId ? { ...os, status: "Completed", actualDeliveryDate: new Date().toISOString().slice(0, 10), receiveImages: os.receiveImages ? [...os.receiveImages, ...receiveImages] : receiveImages } : os
      );
      const allCompleted = newOrderSuppliers.every((os) => os.status === "Completed" || os.status === "Rejected");
      return { ...o, orderSuppliers: newOrderSuppliers, status: allCompleted ? "Completed" : o.status };
    });
    setOrders(next);
    setConfirmModal({ open: false, osId: null });
  };

  const handleConfirmReceive = (osId) => {
    openConfirmModal(osId);
  };

  const handleExportOrder = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const storeName = stores.find((s) => s.id === order.storeId)?.name || order.storeName;
    let html = `
      <!DOCTYPE html><html><head><meta charset="utf-8"><title>Đơn hàng #${order.id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
        .header { margin-bottom: 20px; }
        .section { margin: 15px 0; }
        @media print { body { padding: 0; } }
      </style></head><body>
      <div class="header">
        <h2>ĐƠN HÀNG #${order.id}</h2>
        <p><strong>Cửa hàng:</strong> ${storeName} | <strong>Ngày đặt:</strong> ${order.orderDate} | <strong>Trạng thái:</strong> ${order.status}</p>
      </div>
    `;
    (order.orderSuppliers || []).forEach((os) => {
      html += `<div class="section"><h3>NCC: ${os.supplierName} (${os.status})</h3><table><tr><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th></tr>`;
      (os.orderItems || []).forEach(
        (it) =>
          (html += `<tr><td>${it.productName}</td><td>${it.quantity} ${it.unit}</td><td>${Number(it.price).toLocaleString("vi-VN")} đ</td></tr>`)
      );
      html += `</table><p>Giao dự kiến: ${os.expectedDeliveryDate || "-"} | Giao thực tế: ${os.actualDeliveryDate || "-"}</p></div>`;
    });
    html += "</body></html>";
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
      w.close();
    }, 300);
  };

  /** Xuất đơn riêng theo từng NCC để gửi cho nhà cung cấp */
  const handleExportOrderBySupplier = (os) => {
    const w = window.open("", "_blank");
    if (!w) return;
    const storeName = stores.find((s) => s.id === order.storeId)?.name || order.storeName;
    const total = (os.orderItems || []).reduce((sum, it) => sum + it.quantity * Number(it.price || 0), 0);
    let html = `
      <!DOCTYPE html><html><head><meta charset="utf-8"><title>Đơn #${order.id} - ${os.supplierName}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
        .header { margin-bottom: 20px; }
        .ncc-title { font-size: 16px; margin: 10px 0 5px; color: #1976d2; }
        @media print { body { padding: 0; } }
      </style></head><body>
      <div class="header">
        <h2>ĐƠN HÀNG THEO NCC</h2>
        <p><strong>Đơn tổng #${order.id}</strong> | <strong>Cửa hàng:</strong> ${storeName} | <strong>Ngày đặt:</strong> ${order.orderDate}</p>
        <p class="ncc-title"><strong>Nhà cung cấp:</strong> ${os.supplierName} | Trạng thái: ${os.status}</p>
      </div>
      <table>
        <tr><th>Sản phẩm</th><th>Số lượng</th><th>Đơn vị</th><th>Đơn giá</th><th>Thành tiền</th></tr>
    `;
    (os.orderItems || []).forEach((it) => {
      const subtotal = it.quantity * Number(it.price || 0);
      html += `<tr><td>${it.productName}</td><td>${it.quantity}</td><td>${it.unit}</td><td>${Number(it.price).toLocaleString("vi-VN")} đ</td><td>${subtotal.toLocaleString("vi-VN")} đ</td></tr>`;
    });
    html += `
      </table>
      <p style="margin-top:12px;font-weight:bold;">Tổng cộng: ${total.toLocaleString("vi-VN")} đ</p>
      <p style="margin-top:8px;color:#666;">Giao dự kiến: ${os.expectedDeliveryDate || "-"} | Giao thực tế: ${os.actualDeliveryDate || "-"}</p>
      </body></html>
    `;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
      w.close();
    }, 300);
  };

  if (!order) {
    return (
      <div className="mt-12">
        <Typography>Không tìm thấy đơn hàng.</Typography>
        <Button className="mt-2" onClick={() => navigate("/dashboard/orders")}>Quay lại</Button>
      </div>
    );
  }

  const isStoreOrder = isAdmin || (isStoreUser && currentUser?.storeId === order.storeId);

  return (
    <div className="mt-12">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="text" className="flex items-center gap-1 w-fit" onClick={() => navigate("/dashboard/orders")}>
          <ArrowLeftIcon className="w-4 h-4" /> Quay lại danh sách
        </Button>
        <Button size="sm" variant="outlined" className="flex items-center gap-1 w-fit" onClick={handleExportOrder}>
          <PrinterIcon className="w-4 h-4" /> Xuất đơn / In
        </Button>
      </div>

      <Card className="border border-blue-gray-100 mb-6">
        <CardHeader className="p-4 border-b flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <Typography variant="h5">Đơn hàng #{order.id}</Typography>
            <Typography variant="small" color="gray">{order.storeName} · {order.orderDate}</Typography>
            <Typography variant="small" className="block mt-1">Tổng số dòng: {order.totalItemCount}. Trạng thái: {order.status}.</Typography>
          </div>
          <div className="flex-shrink-0 flex flex-wrap items-center gap-2">
            <Chip color={order.status === "Completed" ? "green" : order.status === "Draft" ? "gray" : order.status === "Cancelled" ? "red" : "blue"} value={order.status} />
            {isAdmin && canAdminAcceptOrRejectOrder && (
              <>
                <Button size="sm" color="green" className="flex items-center gap-1 whitespace-nowrap" onClick={handleAdminAcceptOrder} title="Admin chấp nhận đơn, chuyển sang xử lý">
                  <CheckCircleIcon className="w-4 h-4" /> Chấp nhận đơn
                </Button>
                <Button size="sm" color="red" variant="outlined" className="flex items-center gap-1 whitespace-nowrap" onClick={handleAdminRejectOrder} title="Admin từ chối đơn">
                  <XMarkIcon className="w-4 h-4" /> Từ chối đơn
                </Button>
              </>
            )}
            {isAdmin && canAdminConfirmOrder && (
              <Button size="sm" color="green" className="flex items-center gap-1 whitespace-nowrap" onClick={handleAdminConfirmOrder} title="Admin chấp nhận đơn tổng, đóng đơn">
                <CheckCircleIcon className="w-4 h-4" /> Chấp nhận đơn tổng
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody className="p-4">
          <Typography variant="h6" color="blue-gray" className="mb-2">Quy trình đơn tổng</Typography>
          <OrderTimeline currentStatus={order.status} createdDate={order.createdDate} orderDate={order.orderDate} />
          {isAdmin && canAdminAcceptOrRejectOrder && (
            <Typography variant="small" color="gray" className="mt-2">Đơn đang chờ duyệt. <strong>Admin</strong>: Bấm &quot;Chấp nhận đơn&quot; để chuyển sang xử lý, hoặc &quot;Từ chối đơn&quot; để hủy.</Typography>
          )}
          {isAdmin && canAdminConfirmOrder && (
            <Typography variant="small" color="gray" className="mt-2">Tất cả NCC đã giao xong. <strong>Admin</strong>: Bấm &quot;Chấp nhận đơn tổng&quot; để đóng đơn (khác với Store xác nhận đã nhận hàng).</Typography>
          )}
        </CardBody>
      </Card>

      <Typography variant="h6" className="mb-3">Chi tiết theo từng NCC & theo dõi quy trình</Typography>
      <Typography variant="small" color="gray" className="mb-2 block">Store: dùng &quot;Xác nhận đã nhận hàng&quot; khi đã nhận hàng từ NCC (có thể gửi ảnh). Admin: dùng &quot;Chấp nhận đơn tổng&quot; ở trên để chấp nhận cả đơn.</Typography>
      {(order.orderSuppliers || []).map((os) => (
        <Card key={os.id} className="border border-blue-gray-100 mb-4">
          <CardHeader className="p-4 border-b flex flex-col gap-3 bg-blue-gray-50/50 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <Typography variant="h6">{os.supplierName}</Typography>
              <OrderSupplierTimeline os={os} />
            </div>
            <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
              {isStoreOrder && (
                <Button size="sm" variant="outlined" className="flex items-center gap-1 whitespace-nowrap" onClick={() => handleExportOrderBySupplier(os)}>
                  <DocumentArrowDownIcon className="w-4 h-4" /> Xuất đơn NCC / Gửi
                </Button>
              )}
              <Chip size="sm" color={osStatusColors[os.status] || "gray"} value={os.status} />
              {isStoreOrder && canConfirmReceive(os) && (
                <Button size="sm" color="teal" className="flex items-center gap-1 whitespace-nowrap" onClick={() => handleConfirmReceive(os.id)} title="Store xác nhận đã nhận được hàng từ NCC này, có thể gửi ảnh">
                  <CheckCircleIcon className="w-4 h-4" /> Xác nhận đã nhận hàng
                </Button>
              )}
            </div>
          </CardHeader>
          <CardBody className="p-4">
            {(os.receiveImages?.length > 0) && (
              <div className="mb-4">
                <Typography variant="h6" color="blue-gray" className="mb-2">Ảnh Store đã gửi (Admin & Store xem được)</Typography>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="small" className="font-medium text-blue-gray-600 mb-1 flex items-center gap-1">
                      <PhotoIcon className="w-4 h-4" /> Ảnh đơn hàng nhận được
                    </Typography>
                    <div className="flex flex-wrap gap-2">
                      {os.receiveImages.filter((img) => img.type === "received").map((img) => {
                        const src = img.dataUrl || img.imageUrl;
                        return (
                          <div key={img.id} className="relative">
                            <img src={src} alt={img.fileName} className="h-20 w-20 object-cover rounded border cursor-pointer hover:opacity-90" onClick={() => setLightbox(src)} />
                            <Typography variant="small" className="block truncate w-20 text-xs text-gray-500">{img.fileName}</Typography>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <Typography variant="small" className="font-medium text-blue-gray-600 mb-1 flex items-center gap-1">
                      <DocumentTextIcon className="w-4 h-4" /> Hóa đơn đã ký
                    </Typography>
                    <div className="flex flex-wrap gap-2">
                      {os.receiveImages.filter((img) => img.type === "invoice").map((img) => {
                        const src = img.dataUrl || img.imageUrl;
                        return (
                          <div key={img.id} className="relative">
                            <img src={src} alt={img.fileName} className="h-20 w-20 object-cover rounded border cursor-pointer hover:opacity-90" onClick={() => setLightbox(src)} />
                            <Typography variant="small" className="block truncate w-20 text-xs text-gray-500">{img.fileName}</Typography>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="text-left py-2"><Typography variant="small" className="font-bold text-blue-gray-500">Sản phẩm</Typography></th>
                  <th className="text-left py-2"><Typography variant="small" className="font-bold text-blue-gray-500">Số lượng</Typography></th>
                  <th className="text-left py-2"><Typography variant="small" className="font-bold text-blue-gray-500">Đơn giá</Typography></th>
                </tr>
              </thead>
              <tbody>
                {(os.orderItems || []).map((item) => (
                  <tr key={item.id}>
                    <td className="py-2"><Typography variant="small">{item.productName}</Typography></td>
                    <td className="py-2"><Typography variant="small">{item.quantity} {item.unit}</Typography></td>
                    <td className="py-2"><Typography variant="small">{Number(item.price).toLocaleString("vi-VN")} đ</Typography></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {os.expectedDeliveryDate && <Typography variant="small" color="gray">Giao dự kiến: {os.expectedDeliveryDate}</Typography>}
            {os.actualDeliveryDate && <Typography variant="small" color="gray">Giao thực tế: {os.actualDeliveryDate}</Typography>}
          </CardBody>
        </Card>
      ))}

      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setConfirmModal({ open: false, osId: null })}>
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="p-4 border-b">
              <Typography variant="h6">Xác nhận đã nhận hàng (Store)</Typography>
              <Typography variant="small" color="gray">Store xác nhận đã nhận được hàng từ NCC này. Tải ảnh hàng nhận được và hóa đơn đã ký (có thể nhiều ảnh). Admin sẽ xem được.</Typography>
            </CardHeader>
            <CardBody className="flex flex-col gap-4 p-4">
              <div>
                <label className="block text-sm font-medium text-blue-gray-700 mb-1">
                  <PhotoIcon className="w-4 h-4 inline mr-1" /> Ảnh đơn hàng nhận được
                </label>
                <input ref={refReceived} type="file" multiple accept="image/*" className="block w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-gray-700 mb-1">
                  <DocumentTextIcon className="w-4 h-4 inline mr-1" /> Hóa đơn đã ký
                </label>
                <input ref={refInvoice} type="file" multiple accept="image/*" className="block w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outlined" onClick={() => setConfirmModal({ open: false, osId: null })}>Hủy</Button>
                <Button color="teal" onClick={handleConfirmReceiveWithImages}>Xác nhận đã nhận hàng & gửi ảnh</Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Xem ảnh" className="max-w-full max-h-full object-contain rounded" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

export default OrderDetail;
