"use client";

import React, { useEffect, useState } from "react";
import { visitorAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Visitor } from "@/types/access";
import { AlertCircle, CheckCircle, XCircle, Clock, Plus, Eye, Trash2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import BackButton from "@/components/BackButton";
import Header from "@/components/Header";

export default function VisitorsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'manager'))) {
      router.push('/unauthorized');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'manager')) {
      fetchVisitors();
    }
  }, [user]);

  const fetchVisitors = async () => {
    try {
      setIsLoading(true);
      const data = await visitorAPI.getAll();
      setVisitors(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch visitors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (visitorId: string, newStatus: 'approved' | 'rejected', notes?: string) => {
    try {
      await visitorAPI.updateStatus(visitorId, newStatus, notes);
      await fetchVisitors();
      setSelectedVisitor(null);
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDelete = async (visitorId: string) => {
    if (!confirm('Are you sure you want to delete this visitor record?')) return;
    try {
      await visitorAPI.delete(visitorId);
      await fetchVisitors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete visitor');
    }
  };

  const filteredVisitors = visitors.filter(v => {
    if (filter === 'all') return true;
    return v.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Sidebar />
      <div className="ml-72 p-8">
        <Header />
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <BackButton />
          </div>
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Visitor Management</h1>
              <p className="text-gray-600">Manage and approve visitor requests</p>
            </div>
          </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === f
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-500'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-2 text-sm">
                ({filteredVisitors.filter(v => v.status === (f === 'all' ? undefined : f) || f === 'all').length})
              </span>
            </button>
          ))}
        </div>

        {/* Visitors Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {filteredVisitors.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No visitors found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Visitor Name</th>
                    <th className="px-6 py-4 text-left font-semibold">Purpose</th>
                    <th className="px-6 py-4 text-left font-semibold">Resident</th>
                    <th className="px-6 py-4 text-left font-semibold">Expected Arrival</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredVisitors.map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{visitor.visitor_name}</div>
                        {visitor.visitor_phone && (
                          <div className="text-sm text-gray-500">{visitor.visitor_phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{visitor.purpose}</td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{visitor.resident?.full_name}</div>
                        <div className="text-sm text-gray-500">Apt #{visitor.resident?.apartment_number}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(visitor.expected_arrival).toLocaleDateString()} {new Date(visitor.expected_arrival).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(visitor.status)}`}>
                          {getStatusIcon(visitor.status)}
                          <span className="font-medium text-sm">{visitor.status.charAt(0).toUpperCase() + visitor.status.slice(1)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedVisitor(visitor);
                              setShowModal(true);
                            }}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                            title="View details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {visitor.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(visitor.id, 'approved')}
                                className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                                title="Approve"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(visitor.id, 'rejected')}
                                className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                title="Reject"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(visitor.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
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

        {/* Detail Modal */}
        {showModal && selectedVisitor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Visitor Details</h2>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Name</label>
                    <p className="text-gray-900">{selectedVisitor.visitor_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(selectedVisitor.status)}`}>
                      {getStatusIcon(selectedVisitor.status)}
                      <span className="font-medium">{selectedVisitor.status}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <p className="text-gray-900">{selectedVisitor.visitor_phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <p className="text-gray-900">{selectedVisitor.visitor_email || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                    <p className="text-gray-900">{selectedVisitor.purpose}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Arrival</label>
                    <p className="text-gray-900">{new Date(selectedVisitor.expected_arrival).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Departure</label>
                    <p className="text-gray-900">{selectedVisitor.expected_departure ? new Date(selectedVisitor.expected_departure).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resident</label>
                    <p className="text-gray-900">{selectedVisitor.resident?.full_name} (Apt #{selectedVisitor.resident?.apartment_number})</p>
                  </div>
                  {selectedVisitor.notes && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <p className="text-gray-900">{selectedVisitor.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedVisitor(null);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
