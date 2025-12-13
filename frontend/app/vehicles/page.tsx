'use client';

import UserVehiclePage from "./user/UserView";
import AdminVehiclePage from "./admin/AdminView";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";
import Header from "../../components/Header";

export default function VehiclePage() {
  const { user } = useAuth();

  return user?.role === UserRole.ADMIN
    ? <AdminVehiclePage />
    : <UserVehiclePage />;
}
