"use client";

import React, { useEffect, useState } from "react";
import { residentAPI } from "@/lib/api";
import { apartmentAPI, type Apartment } from "@/lib/apartmentApi";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import { Resident } from "@/types/resident";

export default function AdminResidentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apt, setApt] = useState('');
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', is_owner: false });

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'manager'))) {
      router.push('/unauthorized');
    }
  }, [user, authLoading, router]);

  useEffect(() => { if (user) fetchList(); }, [user, apt]);

  useEffect(() => { if (user) fetchApartments(); }, [user]);

  const fetchApartments = async () => {
    try {
      const { data } = await apartmentAPI.getAll({ page: 1, page_size: 200 });
      setApartments(data || []);
      // Do not auto-select an apartment — default is "all" (empty string)
    } catch (err) {
      console.warn('Failed to fetch apartments for resident filter', err);
    }
  };

  const fetchList = async () => {
    try {
      setIsLoading(true);
      let data: any[] = [];
      if (!apt) {
        // no apartment selected -> fetch all residents
        data = await residentAPI.listAll();
      } else {
        data = await residentAPI.listByApartment(apt);
      }
      setResidents(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load residents');
    } finally { setIsLoading(false); }
  };

  const handleCreate = async () => {
    if (!apt) {
      setError('Vui lòng chọn căn hộ trước khi thêm cư dân');
      return;
    }
    try {
      await residentAPI.create({ apt_id: apt, ...form });
      setShowForm(false);
      setForm({ full_name: '', phone: '', email: '', is_owner: false });
      await fetchList();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to create resident'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xác nhận xóa cư dân?')) return;
    try {
      await residentAPI.delete(id);
      await fetchList();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to delete resident'); }
  };

  if (authLoading || isLoading) return (<div className="flex items-center justify-center min-h-screen"><div>Loading...</div></div>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Sidebar />
      <div className="ml-72 p-8 app-main text-gray-900">
        <Header />
        <div className="max-w-6xl mx-auto">
          <BackButton />
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Quản lý cư dân</h1>
              <p className="text-gray-600">Danh sách cư dân</p>
            </div>
            <div className="flex items-center gap-2">
              <select value={apt} onChange={e => setApt(e.target.value)} className="px-3 py-2 border rounded-lg">
                <option value="">Tất cả căn hộ</option>
                {apartments.map(a => (<option key={a.apt_id} value={a.apt_id}>{a.apt_id}</option>))}
              </select>
              <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Thêm cư dân</button>
            </div>
          </div>

          {error && (<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">{error}</div>)}

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {residents.length === 0 ? (
              <div className="p-12 text-center text-gray-500">Không có cư dân</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-100 text-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Họ tên</th>
                    <th className="px-6 py-4 text-left font-semibold">SĐT</th>
                    <th className="px-6 py-4 text-left font-semibold">Email</th>
                    <th className="px-6 py-4 text-left font-semibold">Vai trò</th>
                    <th className="px-6 py-4 text-left font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white text-gray-800">
                  {residents.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{r.full_name}</td>
                      <td className="px-6 py-4">{r.phone || '—'}</td>
                      <td className="px-6 py-4">{r.email || '—'}</td>
                      <td className="px-6 py-4">{r.is_owner ? 'Chủ hộ' : 'Thành viên'}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleDelete(r.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded">Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {showForm && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Thêm cư dân</h3>
                    <p className="text-sm text-gray-500">Thêm thông tin cư dân vào hệ thống</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800">
                    <span className="text-gray-500">Đóng</span>
                  </button>
                </div>

                <div className="p-6">
                  <form onSubmit={e => { e.preventDefault(); handleCreate(); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Căn hộ</label>
                      <select value={apt} onChange={e => setApt(e.target.value)} className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800">
                        <option value="">-- Chọn căn hộ --</option>
                        {apartments.map(a => (<option key={a.apt_id} value={a.apt_id}>{a.apt_id}</option>))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ và tên</label>
                        <input placeholder="Họ và tên" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại</label>
                        <input placeholder="Số điện thoại" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800" />
                    </div>

                    <div className="flex items-center gap-3">
                      <input id="is_owner" type="checkbox" checked={form.is_owner} onChange={e => setForm({...form, is_owner: e.target.checked})} className="h-4 w-4" />
                      <label htmlFor="is_owner" className="text-sm text-gray-700 dark:text-gray-300">Đánh dấu là chủ hộ</label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-md border text-sm">Hủy</button>
                      <button type="submit" disabled={!form.full_name || !apt} className={`px-4 py-2 rounded-md text-sm text-white ${(!form.full_name || !apt) ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>Lưu</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
