import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Button, Typography, Select, Option } from "@material-tailwind/react";
import { useAuth } from "@/context";
import { usersData } from "@/data";

export function Login() {
  const [selectedUserId, setSelectedUserId] = useState(String(usersData[0].id));
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = usersData.find((u) => u.id === Number(selectedUserId));
    if (user) {
      login(user);
      navigate("/dashboard/home", { replace: true });
    }
  };

  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Đăng nhập</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            Quản lý đặt hàng NCC cho quán cafe. Chọn user để demo (sẽ kết nối BE sau).
          </Typography>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 mb-2 mx-auto w-96 max-w-screen-lg lg:w-1/2">
          <div className="mb-4">
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">Chọn tài khoản demo</Typography>
            <Select
              label="User"
              value={selectedUserId}
              onChange={setSelectedUserId}
              className="!border-t-blue-gray-200"
            >
              {usersData.map((u) => (
                <Option key={u.id} value={String(u.id)}>
                  {u.name} ({u.role}) {u.storeId ? `- Store #${u.storeId}` : ""} {u.supplierId ? `- NCC #${u.supplierId}` : ""}
                </Option>
              ))}
            </Select>
          </div>
          <Button type="submit" className="mt-6" fullWidth>Đăng nhập</Button>
        </form>
        <div className="w-full lg:w-1/2 mx-auto mt-4 text-center">
          <Typography variant="small" color="gray">Demo: Admin Cafe, Chi nhánh (Q1/Q7), NCC (Cà phê/Sữa/Syrup). Sau khi đăng nhập menu sẽ theo role.</Typography>
        </div>
      </div>
      <div className="w-2/5 h-full hidden lg:block">
        <img src="/img/pattern.png" className="h-full w-full object-cover rounded-3xl" alt="" />
      </div>
    </section>
  );
}

export default Login;
