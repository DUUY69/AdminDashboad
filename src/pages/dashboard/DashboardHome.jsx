import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Typography, Card, CardHeader, CardBody, Button, Chip } from "@material-tailwind/react";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import { chartsConfig } from "@/configs";
import { useAuth } from "@/context";
import { useData } from "@/context/DataContext";
import {
  ClipboardDocumentListIcon,
  TruckIcon,
  PlusCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { EllipsisVerticalIcon, ArrowUpIcon, ClockIcon } from "@heroicons/react/24/outline";

const icon = { className: "w-6 h-6 text-white" };

export function DashboardHome() {
  const navigate = useNavigate();
  const { currentUser, isAdmin, isStoreUser, isSupplierUser, storeName, supplierName } = useAuth();
  const { orders } = useData();

  const totalOrders = orders.length;
  const deliveringCount = orders.filter(
    (o) => o.status === "Processing" || o.orderSuppliers?.some((os) => os.status === "Delivering")
  ).length;
  const today = new Date().toISOString().slice(0, 10);
  const lateCount = orders.reduce((sum, o) => {
    return sum + (o.orderSuppliers || []).filter((os) => {
      if (os.status === "Delivering" && os.expectedDeliveryDate) return os.expectedDeliveryDate < today;
      if ((os.status === "Delivered" || os.status === "Completed") && os.actualDeliveryDate && os.expectedDeliveryDate) return os.actualDeliveryDate > os.expectedDeliveryDate;
      return false;
    }).length;
  }, 0);

  const storeOrders = isStoreUser ? orders.filter((o) => o.storeId === currentUser?.storeId) : [];
  const supplierOrderSuppliers = isSupplierUser
    ? orders.flatMap((o) => o.orderSuppliers || []).filter((os) => os.supplierId === currentUser?.supplierId)
    : [];

  // Chart data: đơn theo tháng (Admin)
  const ordersByMonthChart = useMemo(() => {
    const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
    const count = months.map((_, i) => orders.filter((o) => o.orderDate && new Date(o.orderDate).getMonth() === i).length);
    return {
      type: "bar",
      height: 220,
      series: [{ name: "Số đơn", data: count }],
      options: {
        ...chartsConfig,
        colors: "#0288d1",
        plotOptions: { bar: { columnWidth: "60%", borderRadius: 5 } },
        xaxis: { ...chartsConfig.xaxis, categories: months },
      },
    };
  }, [orders]);

  const ordersByStatusChart = useMemo(() => {
    const statuses = ["Draft", "Submitted", "Processing", "Completed", "Cancelled"];
    const count = statuses.map((s) => orders.filter((o) => o.status === s).length);
    return {
      type: "bar",
      height: 220,
      series: [{ name: "Số đơn", data: count }],
      options: {
        ...chartsConfig,
        colors: "#388e3c",
        plotOptions: { bar: { columnWidth: "60%", borderRadius: 5 } },
        xaxis: { ...chartsConfig.xaxis, categories: statuses },
      },
    };
  }, [orders]);

  const ordersTrendChart = useMemo(() => {
    const weeks = ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"];
    const count = weeks.map((_, i) =>
      orders.filter((o) => o.orderDate && Math.ceil(new Date(o.orderDate).getDate() / 7) === i + 1).length
    );
    const hasData = count.some((n) => n > 0);
    return {
      type: "line",
      height: 220,
      series: [{ name: "Đơn hàng", data: hasData ? count : [1, 2, 1, 1] }],
      options: {
        ...chartsConfig,
        colors: ["#0288d1"],
        stroke: { lineCap: "round" },
        markers: { size: 5 },
        xaxis: { ...chartsConfig.xaxis, categories: weeks },
      },
    };
  }, [orders]);

  const recentOrders = useMemo(() => orders.slice(-5).reverse(), [orders]);
  const orderOverviewList = useMemo(() => {
    return [...orders].reverse().slice(0, 6).map((o) => ({
      title: `Đơn #${o.id} - ${o.storeName}`,
      description: `${o.orderDate} · ${o.status}`,
    }));
  }, [orders]);

  const storeRecentOrders = useMemo(() => storeOrders.slice(-5).reverse(), [storeOrders]);
  const storeOrderOverviewList = useMemo(() => {
    return [...storeOrders].reverse().slice(0, 6).map((o) => ({
      title: `Đơn #${o.id} - ${o.storeName}`,
      description: `${o.orderDate} · ${o.status}`,
    }));
  }, [storeOrders]);

  const storeOrdersByMonthChart = useMemo(() => {
    const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
    const count = months.map((_, i) => storeOrders.filter((o) => o.orderDate && new Date(o.orderDate).getMonth() === i).length);
    return { type: "bar", height: 220, series: [{ name: "Số đơn", data: count }], options: { ...chartsConfig, colors: "#0288d1", plotOptions: { bar: { columnWidth: "60%", borderRadius: 5 } }, xaxis: { ...chartsConfig.xaxis, categories: months } } };
  }, [storeOrders]);
  const storeOrdersByStatusChart = useMemo(() => {
    const statuses = ["Draft", "Submitted", "Processing", "Completed", "Cancelled"];
    const count = statuses.map((s) => storeOrders.filter((o) => o.status === s).length);
    return { type: "bar", height: 220, series: [{ name: "Số đơn", data: count }], options: { ...chartsConfig, colors: "#388e3c", plotOptions: { bar: { columnWidth: "60%", borderRadius: 5 } }, xaxis: { ...chartsConfig.xaxis, categories: statuses } } };
  }, [storeOrders]);
  const storeOrdersTrendChart = useMemo(() => {
    const weeks = ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"];
    const count = weeks.map((_, i) => storeOrders.filter((o) => o.orderDate && Math.ceil(new Date(o.orderDate).getDate() / 7) === i + 1).length);
    const hasData = count.some((n) => n > 0);
    return { type: "line", height: 220, series: [{ name: "Đơn hàng", data: hasData ? count : [0, 1, 0, 1] }], options: { ...chartsConfig, colors: ["#0288d1"], stroke: { lineCap: "round" }, markers: { size: 5 }, xaxis: { ...chartsConfig.xaxis, categories: weeks } } };
  }, [storeOrders]);

  const pendingSupplier = supplierOrderSuppliers.filter((os) => os.status === "Pending").length;
  const todayDelivery = supplierOrderSuppliers.filter((os) => os.expectedDeliveryDate === "2025-03-01").length;

  return (
    <div className="mt-12">
      {isAdmin && (
        <>
          <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
            <StatisticsCard
              color="blue"
              icon={<ClipboardDocumentListIcon {...icon} />}
              title="Tổng số đơn"
              value={String(totalOrders)}
              footer={
                <Typography className="font-normal text-blue-gray-600">
                  <strong className="text-blue-500">Toàn hệ thống</strong>
                </Typography>
              }
            />
            <StatisticsCard
              color="orange"
              icon={<TruckIcon {...icon} />}
              title="Đơn đang giao"
              value={String(deliveringCount)}
              footer={
                <Typography className="font-normal text-blue-gray-600">
                  <strong className="text-orange-500">Processing</strong>
                </Typography>
              }
            />
            <StatisticsCard
              color="red"
              icon={<ExclamationTriangleIcon {...icon} />}
              title="NCC giao trễ"
              value={String(lateCount)}
              footer={
                <Typography className="font-normal text-blue-gray-600">
                  <strong className="text-red-500">Cần theo dõi</strong>
                </Typography>
              }
            />
            <StatisticsCard
              color="green"
              icon={<ChartBarIcon {...icon} />}
              title="Báo cáo tháng"
              value="Xem"
              footer={
                <Typography className="font-normal text-blue-gray-600">
                  <Link to="/dashboard/reports">
                    <strong className="text-green-500">Đến trang Report</strong>
                  </Link>
                </Typography>
              }
            />
          </div>
          <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
            <StatisticsChart
              color="white"
              title="Xem đơn theo tháng"
              description="Số đơn tạo theo từng tháng"
              chart={ordersByMonthChart}
              footer={
                <Typography variant="small" className="flex items-center font-normal text-blue-gray-600">
                  <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400 mr-1" />
                  Dữ liệu mẫu – sẽ cập nhật từ BE
                </Typography>
              }
            />
            <StatisticsChart
              color="white"
              title="Doanh số đơn hàng"
              description="Xu hướng đơn theo tuần"
              chart={ordersTrendChart}
              footer={
                <Typography variant="small" className="flex items-center font-normal text-blue-gray-600">
                  <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400 mr-1" />
                  Đã cập nhật gần đây
                </Typography>
              }
            />
            <StatisticsChart
              color="white"
              title="Các đơn theo trạng thái"
              description="Draft, Submitted, Processing, Completed"
              chart={ordersByStatusChart}
              footer={
                <Typography variant="small" className="flex items-center font-normal text-blue-gray-600">
                  <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400 mr-1" />
                  Tổng {totalOrders} đơn
                </Typography>
              }
            />
          </div>
          <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
              <CardHeader
                floated={false}
                shadow={false}
                color="transparent"
                className="m-0 flex items-center justify-between p-6"
              >
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-1">
                    Đơn gần đây
                  </Typography>
                  <Typography variant="small" className="flex items-center gap-1 font-normal text-blue-gray-600">
                    <CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-blue-gray-200" />
                    <strong>{recentOrders.length} đơn</strong> mới nhất
                  </Typography>
                </div>
                <Link to="/dashboard/orders">
                  <Button size="sm" variant="outlined">Xem tất cả</Button>
                </Link>
              </CardHeader>
              <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                <table className="w-full min-w-[640px] table-auto">
                  <thead>
                    <tr>
                      {["Mã đơn", "Cửa hàng", "Ngày đặt", "Trạng thái", "Thao tác"].map((el) => (
                        <th key={el} className="border-b border-blue-gray-50 py-3 px-6 text-left">
                          <Typography variant="small" className="text-[11px] font-medium uppercase text-blue-gray-400">{el}</Typography>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr key={o.id}>
                        <td className="border-b border-blue-gray-50 py-3 px-6">
                          <Typography variant="small" className="font-semibold">#{o.id}</Typography>
                        </td>
                        <td className="border-b border-blue-gray-50 py-3 px-6">
                          <Typography variant="small">{o.storeName}</Typography>
                        </td>
                        <td className="border-b border-blue-gray-50 py-3 px-6">
                          <Typography variant="small">{o.orderDate}</Typography>
                        </td>
                        <td className="border-b border-blue-gray-50 py-3 px-6">
                          <Chip size="sm" value={o.status} color={o.status === "Completed" ? "green" : o.status === "Draft" ? "gray" : "blue"} />
                        </td>
                        <td className="border-b border-blue-gray-50 py-3 px-6">
                          <Button size="sm" variant="text" className="p-1 text-xs font-semibold text-blue-600" onClick={() => navigate(`/dashboard/orders/${o.id}`)}>
                            Xem / Theo dõi
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>
            <Card className="border border-blue-gray-100 shadow-sm">
              <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-6">
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Tổng quan đơn hàng
                </Typography>
                <Typography variant="small" className="flex items-center gap-1 font-normal text-blue-gray-600">
                  <ArrowUpIcon strokeWidth={3} className="h-3.5 w-3.5 text-green-500" />
                  <strong>↑ {totalOrders}</strong> đơn trong hệ thống
                </Typography>
              </CardHeader>
              <CardBody className="pt-0">
                {orderOverviewList.map((item, key) => (
                  <div key={key} className="flex items-start gap-4 py-3">
                    <div
                      className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
                        key === orderOverviewList.length - 1 ? "after:h-0" : "after:h-4/6"
                      }`}
                    >
                      <ShoppingCartIcon className="!w-5 !h-5 text-blue-gray-300" />
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="block font-medium">
                        {item.title}
                      </Typography>
                      <Typography as="span" variant="small" className="text-xs font-medium text-blue-gray-500">
                        {item.description}
                      </Typography>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </>
      )}

      {isStoreUser && (
        <>
          <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
            <StatisticsCard
              color="blue"
              icon={<ClipboardDocumentListIcon {...icon} />}
              title="Tổng số đơn"
              value={String(storeOrders.length)}
              footer={
                <Typography className="font-normal text-blue-gray-600">
                  <strong className="text-blue-500">{storeName}</strong>
                </Typography>
              }
            />
            <StatisticsCard
              color="orange"
              icon={<TruckIcon {...icon} />}
              title="Đơn đang giao"
              value={String(storeOrders.filter((o) => o.status === "Processing").length)}
              footer={
                <Typography className="font-normal text-blue-gray-600">
                  <strong className="text-orange-500">Processing</strong>
                </Typography>
              }
            />
            <StatisticsCard
              color="red"
              icon={<ExclamationTriangleIcon {...icon} />}
              title="Đơn chờ xử lý"
              value={String(storeOrders.filter((o) => o.status === "Submitted").length)}
              footer={
                <Typography className="font-normal text-blue-gray-600">
                  <strong className="text-red-500">Submitted</strong>
                </Typography>
              }
            />
            <StatisticsCard
              color="green"
              icon={<ChartBarIcon {...icon} />}
              title="Tạo đơn / Theo dõi"
              value="→"
              footer={
                <Typography className="font-normal text-blue-gray-600">
                  <Link to="/dashboard/create-order"><strong className="text-green-500">Tạo đơn</strong></Link>
                  {" · "}
                  <Link to="/dashboard/orders"><strong className="text-green-500">Danh sách đơn</strong></Link>
                </Typography>
              }
            />
          </div>
          <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
            <StatisticsChart
              color="white"
              title="Xem đơn theo tháng"
              description={`Số đơn của ${storeName} theo tháng`}
              chart={storeOrdersByMonthChart}
              footer={
                <Typography variant="small" className="flex items-center font-normal text-blue-gray-600">
                  <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400 mr-1" />
                  Dữ liệu cửa hàng
                </Typography>
              }
            />
            <StatisticsChart
              color="white"
              title="Doanh số đơn hàng"
              description="Xu hướng đơn theo tuần"
              chart={storeOrdersTrendChart}
              footer={
                <Typography variant="small" className="flex items-center font-normal text-blue-gray-600">
                  <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400 mr-1" />
                  Đã cập nhật gần đây
                </Typography>
              }
            />
            <StatisticsChart
              color="white"
              title="Các đơn theo trạng thái"
              description="Draft, Submitted, Processing, Completed"
              chart={storeOrdersByStatusChart}
              footer={
                <Typography variant="small" className="flex items-center font-normal text-blue-gray-600">
                  <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400 mr-1" />
                  Tổng {storeOrders.length} đơn
                </Typography>
              }
            />
          </div>
          <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
              <CardHeader
                floated={false}
                shadow={false}
                color="transparent"
                className="m-0 flex items-center justify-between p-6"
              >
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-1">Đơn gần đây</Typography>
                  <Typography variant="small" className="flex items-center gap-1 font-normal text-blue-gray-600">
                    <CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-blue-gray-200" />
                    <strong>{storeRecentOrders.length} đơn</strong> mới nhất
                  </Typography>
                </div>
                <Link to="/dashboard/orders">
                  <Button size="sm" variant="outlined">Xem tất cả</Button>
                </Link>
              </CardHeader>
              <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                <table className="w-full min-w-[640px] table-auto">
                  <thead>
                    <tr>
                      {["Mã đơn", "Cửa hàng", "Ngày đặt", "Trạng thái", "Thao tác"].map((el) => (
                        <th key={el} className="border-b border-blue-gray-50 py-3 px-6 text-left">
                          <Typography variant="small" className="text-[11px] font-medium uppercase text-blue-gray-400">{el}</Typography>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {storeRecentOrders.map((o) => (
                      <tr key={o.id}>
                        <td className="border-b border-blue-gray-50 py-3 px-6"><Typography variant="small" className="font-semibold">#{o.id}</Typography></td>
                        <td className="border-b border-blue-gray-50 py-3 px-6"><Typography variant="small">{o.storeName}</Typography></td>
                        <td className="border-b border-blue-gray-50 py-3 px-6"><Typography variant="small">{o.orderDate}</Typography></td>
                        <td className="border-b border-blue-gray-50 py-3 px-6">
                          <Chip size="sm" value={o.status} color={o.status === "Completed" ? "green" : o.status === "Draft" ? "gray" : "blue"} />
                        </td>
                        <td className="border-b border-blue-gray-50 py-3 px-6">
                          <Button size="sm" variant="text" className="p-1 text-xs font-semibold text-blue-600" onClick={() => navigate(`/dashboard/orders/${o.id}`)}>
                            Xem / Theo dõi
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>
            <Card className="border border-blue-gray-100 shadow-sm">
              <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-6">
                <Typography variant="h6" color="blue-gray" className="mb-2">Tổng quan đơn hàng</Typography>
                <Typography variant="small" className="flex items-center gap-1 font-normal text-blue-gray-600">
                  <ArrowUpIcon strokeWidth={3} className="h-3.5 w-3.5 text-green-500" />
                  <strong>↑ {storeOrders.length}</strong> đơn của cửa hàng
                </Typography>
              </CardHeader>
              <CardBody className="pt-0">
                {storeOrderOverviewList.map((item, key) => (
                  <div key={key} className="flex items-start gap-4 py-3">
                    <div className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${key === storeOrderOverviewList.length - 1 ? "after:h-0" : "after:h-4/6"}`}>
                      <ShoppingCartIcon className="!w-5 !h-5 text-blue-gray-300" />
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="block font-medium">{item.title}</Typography>
                      <Typography as="span" variant="small" className="text-xs font-medium text-blue-gray-500">{item.description}</Typography>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </>
      )}

      {isSupplierUser && (
        <>
          <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
            <StatisticsCard
              color="blue"
              icon={<ClipboardDocumentListIcon {...icon} />}
              title="Đơn mới (Pending)"
              value={String(pendingSupplier)}
              footer={
                <Typography className="font-normal text-blue-gray-600">
                  Cần xác nhận
                </Typography>
              }
            />
            <StatisticsCard
              color="orange"
              icon={<TruckIcon {...icon} />}
              title="Đơn giao hôm nay"
              value={String(todayDelivery)}
              footer={
                <Typography className="font-normal text-blue-gray-600">
                  ExpectedDeliveryDate = hôm nay
                </Typography>
              }
            />
            <Card className="border border-blue-gray-100 flex items-center justify-center p-6">
              <Link to="/dashboard/supplier-orders">
                <Button color="blue">Xem danh sách đơn của tôi</Button>
              </Link>
            </Card>
          </div>
          <Card className="border border-blue-gray-100">
            <CardBody>
              <Typography variant="h6" color="blue-gray">
                NCC: <strong>{supplierName}</strong>. Vào "Đơn cần xử lý" để Confirm / Reject / cập nhật Delivering / Delivered.
              </Typography>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}

export default DashboardHome;
