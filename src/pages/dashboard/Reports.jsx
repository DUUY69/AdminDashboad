import React, { useState } from "react";
import { Card, CardHeader, CardBody, Typography, Button, Input } from "@material-tailwind/react";
import { ArrowDownTrayIcon, FunnelIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { StatisticsChart } from "@/widgets/charts";
import { chartsConfig } from "@/configs";
import { useData } from "@/context/DataContext";

export function Reports() {
  const { orders, suppliers, stores } = useData();
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const filteredOrders = React.useMemo(() => {
    let list = orders;
    if (filterDateFrom) list = list.filter((o) => o.orderDate >= filterDateFrom);
    if (filterDateTo) list = list.filter((o) => o.orderDate <= filterDateTo);
    return list;
  }, [orders, filterDateFrom, filterDateTo]);

  const bySupplier = React.useMemo(() => {
    const map = {};
    suppliers.forEach((s) => { map[s.id] = { name: s.name, totalOrders: 0, completed: 0, totalItems: 0 }; });
    filteredOrders.forEach((o) => {
      (o.orderSuppliers || []).forEach((os) => {
        if (!map[os.supplierId]) return;
        map[os.supplierId].totalOrders += 1;
        if (os.status === "Completed" || os.status === "Delivered") map[os.supplierId].completed += 1;
        (os.orderItems || []).forEach((it) => { map[os.supplierId].totalItems += it.quantity; });
      });
    });
    return Object.entries(map).map(([id, v]) => ({ id, ...v }));
  }, [filteredOrders, suppliers]);

  const byStore = React.useMemo(() => {
    const map = {};
    stores.forEach((s) => { map[s.id] = { name: s.name, totalOrders: 0 }; });
    filteredOrders.forEach((o) => {
      if (map[o.storeId]) map[o.storeId].totalOrders += 1;
    });
    return Object.entries(map).map(([id, v]) => ({ id, ...v }));
  }, [filteredOrders, stores]);

  const chartBySupplier = React.useMemo(() => ({
    type: "bar",
    height: 280,
    series: [{ name: "Số đơn", data: bySupplier.map((r) => r.totalOrders) }],
    options: {
      ...chartsConfig,
      colors: "#0288d1",
      plotOptions: { bar: { columnWidth: "50%", borderRadius: 5 } },
      xaxis: { ...chartsConfig.xaxis, categories: bySupplier.map((r) => r.name.length > 15 ? r.name.slice(0, 14) + "…" : r.name) },
    },
  }), [bySupplier]);

  const chartByStore = React.useMemo(() => ({
    type: "bar",
    height: 280,
    series: [{ name: "Số đơn", data: byStore.map((r) => r.totalOrders) }],
    options: {
      ...chartsConfig,
      colors: "#388e3c",
      plotOptions: { bar: { columnWidth: "50%", borderRadius: 5 } },
      xaxis: { ...chartsConfig.xaxis, categories: byStore.map((r) => r.name) },
    },
  }), [byStore]);

  const exportExcel = () => alert("Chức năng Export Excel sẽ kết nối BE. Hiện tại dùng dữ liệu mẫu.");

  const hasFilters = filterDateFrom || filterDateTo;
  const clearFilters = () => { setFilterDateFrom(""); setFilterDateTo(""); };

  return (
    <div className="mt-12">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <Typography variant="h4" color="blue-gray">Báo cáo thống kê</Typography>
        <Button className="flex items-center gap-2" onClick={exportExcel}><ArrowDownTrayIcon className="w-5 h-5" /> Export Excel</Button>
      </div>

      <Card className="border border-blue-gray-100 mb-6">
        <CardHeader className="p-4 border-b">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Typography variant="h6" color="blue-gray">Bộ lọc báo cáo</Typography>
              {hasFilters && (
                <Button variant="text" size="sm" className="flex items-center gap-1 text-red-600" onClick={clearFilters}>
                  <XMarkIcon className="w-4 h-4" /> Xóa bộ lọc
                </Button>
              )}
            </div>
            <div className="flex flex-row flex-wrap items-end gap-4 w-full">
              <div className="flex items-center gap-1 text-blue-gray-500 shrink-0">
                <FunnelIcon className="w-4 h-4" />
                <Typography variant="small" className="font-medium">Lọc theo ngày đặt đơn:</Typography>
              </div>
              <div className="w-[150px] shrink-0 mr-4">
                <Input type="date" label="Từ ngày" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="!min-w-0" />
              </div>
              <div className="w-[150px] shrink-0">
                <Input type="date" label="Đến ngày" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="!min-w-0" />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
        <StatisticsChart
          color="white"
          title="Biểu đồ đơn theo NCC"
          description="Tổng số đơn (OrderSupplier) theo từng nhà cung cấp"
          chart={chartBySupplier}
        />
        <StatisticsChart
          color="white"
          title="Biểu đồ đơn theo Cửa hàng"
          description="Tổng số đơn (Order) theo từng cửa hàng"
          chart={chartByStore}
        />
      </div>

      <Card className="border border-blue-gray-100 mb-6">
        <CardHeader className="p-4 border-b"><Typography variant="h6">Report theo NCC</Typography></CardHeader>
        <CardBody className="overflow-x-auto p-0">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left"><Typography variant="small" className="font-bold text-blue-gray-500">NCC</Typography></th>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left"><Typography variant="small" className="font-bold text-blue-gray-500">Số đơn</Typography></th>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left"><Typography variant="small" className="font-bold text-blue-gray-500">Đã hoàn thành</Typography></th>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left"><Typography variant="small" className="font-bold text-blue-gray-500">Tổng SL sản phẩm</Typography></th>
              </tr>
            </thead>
            <tbody>
              {bySupplier.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Typography variant="small">{r.name}</Typography></td>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Typography variant="small">{r.totalOrders}</Typography></td>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Typography variant="small">{r.completed}</Typography></td>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Typography variant="small">{r.totalItems}</Typography></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <Card className="border border-blue-gray-100">
        <CardHeader className="p-4 border-b"><Typography variant="h6">Report theo Cửa hàng</Typography></CardHeader>
        <CardBody className="overflow-x-auto p-0">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left"><Typography variant="small" className="font-bold text-blue-gray-500">Cửa hàng</Typography></th>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left"><Typography variant="small" className="font-bold text-blue-gray-500">Tổng số đơn</Typography></th>
              </tr>
            </thead>
            <tbody>
              {byStore.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Typography variant="small">{r.name}</Typography></td>
                  <td className="py-3 px-4 border-b border-blue-gray-50"><Typography variant="small">{r.totalOrders}</Typography></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

export default Reports;
