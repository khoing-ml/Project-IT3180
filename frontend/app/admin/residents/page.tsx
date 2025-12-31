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
import { Edit, Trash2, UserPlus, Users as UsersIcon } from "lucide-react";

export default function AdminResidentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apt, setApt] = useState('');
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [form, setForm] = useState({ 
    full_name: '', 
    phone: '', 
    email: '', 
    is_owner: false, 
    yearOfBirth: '', 
    hometown: '', 
    gender: '' 
  });

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
    } catch (err) {
      console.warn('Failed to fetch apartments for resident filter', err);
    }
  };

  const fetchList = async () => {
    try {
      setIsLoading(true);
      let data: any[] = [];
      if (!apt) {
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
      setError(null);
      await residentAPI.create({ apt_id: apt, ...form });
      setShowForm(false);
      setForm({ full_name: '', phone: '', email: '', is_owner: false, yearOfBirth: '', hometown: '', gender: '' });
      await fetchList();
    } catch (err) { 
      setError(err instanceof Error ? err.message : 'Failed to create resident'); 
    }
  };

  const handleEdit = (resident: Resident) => {
    setEditingResident(resident);
    setForm({
      full_name: resident.full_name || '',
      phone: resident.phone || '',
      email: resident.email || '',
      is_owner: resident.is_owner || false,
      yearOfBirth: resident.yearOfBirth?.toString() || '',
      hometown: resident.hometown || '',
      gender: resident.gender || ''
    });
    setShowEditForm(true);
  };

  const handleUpdate = async () => {
    if (!editingResident) return;
    try {
      setError(null);
      await residentAPI.update(editingResident.id, form);
      setShowEditForm(false);
      setEditingResident(null);
      setForm({ full_name: '', phone: '', email: '', is_owner: false, yearOfBirth: '', hometown: '', gender: '' });
      await fetchList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update resident');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xác nhận xóa cư dân? Nếu là chủ hộ, cần chỉ định chủ hộ mới.')) return;
    try {
      setError(null);
      await residentAPI.delete(id);
      await fetchList();
    } catch (err) { 
      setError(err instanceof Error ? err.message : 'Failed to delete resident'); 
    }
  };

  if (authLoading || isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Sidebar />
      <div className="ml-72 p-8 app-main text-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto">
          <BackButton />
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 shadow-lg">
                <UsersIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Quản lý cư dân
                </h1>
                <p className="text-gray-600 mt-1">Quản lý thông tin cư dân trong chung cư</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 border border-slate-200 dark:border-gray-700 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo căn hộ</label>
                <select 
                  value={apt} 
                  onChange={e => setApt(e.target.value)} 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Tất cả căn hộ</option>
                  {apartments.map(a => (
                    <option key={a.apt_id} value={a.apt_id}>{a.apt_id} - {a.owner_name || 'Chưa có chủ hộ'}</option>
                  ))}
                </select>
              </div>
              <div className="pt-6">
                <button 
                  onClick={() => setShowForm(true)} 
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold"
                >
                  <UserPlus className="w-5 h-5" />
                  Thêm cư dân
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-2xl text-red-800 shadow-lg">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-slate-200 dark:border-gray-700 shadow-2xl overflow-hidden">
            {residents.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <UsersIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Không có cư dân</p>
                <p className="text-sm text-gray-400 mt-2">Thêm cư dân mới để bắt đầu quản lý</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Căn hộ</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Họ tên</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">SĐT</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Vai trò</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Năm sinh</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Giới tính</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                    {residents.map(r => (
                      <tr key={r.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-blue-600">{r.apt_id}</td>
                        <td className="px-6 py-4 font-medium">{r.full_name}</td>
                        <td className="px-6 py-4">{r.phone || '—'}</td>
                        <td className="px-6 py-4">{r.email || '—'}</td>
                        <td className="px-6 py-4">
                          {r.is_owner ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-300">
                              Chủ hộ
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300">
                              Thành viên
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">{r.yearOfBirth || '—'}</td>
                        <td className="px-6 py-4">{r.gender === 'male' ? 'Nam' : r.gender === 'female' ? 'Nữ' : r.gender || '—'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleEdit(r)} 
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              Sửa
                            </button>
                            <button 
                              onClick={() => handleDelete(r.id)} 
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Create Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Thêm cư dân mới</h3>
                    <p className="text-sm text-gray-500 mt-1">Điền thông tin cư dân vào hệ thống</p>
                  </div>
                  <button 
                    onClick={() => setShowForm(false)} 
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-2xl text-gray-500">&times;</span>
                  </button>
                </div>

                <form onSubmit={e => { e.preventDefault(); handleCreate(); }} className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Căn hộ *</label>
                    <select 
                      value={apt} 
                      onChange={e => setApt(e.target.value)} 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    >
                      <option value="">-- Chọn căn hộ --</option>
                      {apartments.map(a => (
                        <option key={a.apt_id} value={a.apt_id}>
                          {a.apt_id} - {a.owner_name || 'Chưa có chủ hộ'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên *</label>
                      <input 
                        type="text"
                        placeholder="Nguyễn Văn A" 
                        value={form.full_name} 
                        onChange={e => setForm({...form, full_name: e.target.value})} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                      <input 
                        type="tel"
                        placeholder="0901234567" 
                        value={form.phone} 
                        onChange={e => setForm({...form, phone: e.target.value})} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input 
                      type="email"
                      placeholder="email@example.com" 
                      value={form.email} 
                      onChange={e => setForm({...form, email: e.target.value})} 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Năm sinh</label>
                      <input 
                        type="number" 
                        placeholder="1990" 
                        value={form.yearOfBirth} 
                        onChange={e => setForm({...form, yearOfBirth: e.target.value})} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Quê quán</label>
                      <input 
                        type="text"
                        placeholder="Hà Nội" 
                        value={form.hometown} 
                        onChange={e => setForm({...form, hometown: e.target.value})} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Giới tính</label>
                      <select 
                        value={form.gender} 
                        onChange={e => setForm({...form, gender: e.target.value})} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="">-- Chọn --</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <input 
                      id="is_owner" 
                      type="checkbox" 
                      checked={form.is_owner} 
                      onChange={e => setForm({...form, is_owner: e.target.checked})} 
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="is_owner" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Đánh dấu là chủ hộ (sẽ tự động bỏ chủ hộ hiện tại nếu có)
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <button 
                      type="button" 
                      onClick={() => setShowForm(false)} 
                      className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button 
                      type="submit" 
                      disabled={!form.full_name || !apt} 
                      className={`px-6 py-3 rounded-xl text-white font-semibold transition-all ${
                        (!form.full_name || !apt) 
                          ? 'bg-gray-300 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:scale-105'
                      }`}
                    >
                      Lưu thông tin
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {showEditForm && editingResident && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa cư dân</h3>
                    <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin: {editingResident.full_name}</p>
                  </div>
                  <button 
                    onClick={() => { setShowEditForm(false); setEditingResident(null); }} 
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-2xl text-gray-500">&times;</span>
                  </button>
                </div>

                <form onSubmit={e => { e.preventDefault(); handleUpdate(); }} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên *</label>
                      <input 
                        type="text"
                        placeholder="Nguyễn Văn A" 
                        value={form.full_name} 
                        onChange={e => setForm({...form, full_name: e.target.value})} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                      <input 
                        type="tel"
                        placeholder="0901234567" 
                        value={form.phone} 
                        onChange={e => setForm({...form, phone: e.target.value})} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input 
                      type="email"
                      placeholder="email@example.com" 
                      value={form.email} 
                      onChange={e => setForm({...form, email: e.target.value})} 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Năm sinh</label>
                      <input 
                        type="number" 
                        placeholder="1990" 
                        value={form.yearOfBirth} 
                        onChange={e => setForm({...form, yearOfBirth: e.target.value})} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Quê quán</label>
                      <input 
                        type="text"
                        placeholder="Hà Nội" 
                        value={form.hometown} 
                        onChange={e => setForm({...form, hometown: e.target.value})} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Giới tính</label>
                      <select 
                        value={form.gender} 
                        onChange={e => setForm({...form, gender: e.target.value})} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="">-- Chọn --</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <input 
                      id="is_owner_edit" 
                      type="checkbox" 
                      checked={form.is_owner} 
                      onChange={e => setForm({...form, is_owner: e.target.checked})} 
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="is_owner_edit" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Đánh dấu là chủ hộ
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <button 
                      type="button" 
                      onClick={() => { setShowEditForm(false); setEditingResident(null); }} 
                      className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button 
                      type="submit" 
                      disabled={!form.full_name} 
                      className={`px-6 py-3 rounded-xl text-white font-semibold transition-all ${
                        !form.full_name 
                          ? 'bg-gray-300 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:scale-105'
                      }`}
                    >
                      Cập nhật
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
