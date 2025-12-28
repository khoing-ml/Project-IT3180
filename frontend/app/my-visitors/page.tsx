"use client";

import React, { useEffect, useState } from "react";
import { visitorAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Visitor } from "@/types/access";
import { AlertCircle, CheckCircle, XCircle, Clock, Plus, Trash2, Eye } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import BackButton from "@/components/BackButton";
import Header from "@/components/Header";

export default function MyVisitorsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [formData, setFormData] = useState({
    visitor_name: '',
    visitor_phone: '',
    visitor_email: '',
    purpose: '',
    expected_arrival: '',
    expected_departure: '',
    notes: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await visitorAPI.create(formData);
      setFormData({
        visitor_name: '',
        visitor_phone: '',
        visitor_email: '',
        purpose: '',
        expected_arrival: '',
        expected_departure: '',
        notes: ''
      });
      setShowForm(false);
      await fetchVisitors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create visitor request');
    }
  };

  const handleCancel = async (visitorId: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    try {
      await visitorAPI.cancel(visitorId);
      await fetchVisitors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel request');
    }
  };

  const handleDelete = async (visitorId: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await visitorAPI.delete(visitorId);
      await fetchVisitors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record');
    }
  };

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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Visitors</h1>
              <p className="text-gray-600">Register and manage your visitor requests</p>
            </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
          >
            <Plus className="w-5 h-5" />
            Register Visitor
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Visitors Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {visitors.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-6">No visitor requests yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Register Your First Visitor
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Visitor Name</th>
                    <th className="px-6 py-4 text-left font-semibold">Purpose</th>
                    <th className="px-6 py-4 text-left font-semibold">Expected Arrival</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {visitors.map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{visitor.visitor_name}</div>
                        {visitor.visitor_phone && (
                          <div className="text-sm text-gray-500">{visitor.visitor_phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{visitor.purpose}</td>
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
                              setShowDetail(true);
                            }}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                            title="View details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {(visitor.status === 'pending' || visitor.status === 'approved') && (
                            <button
                              onClick={() => handleCancel(visitor.id)}
                              className="p-2 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-600"
                              title="Cancel request"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
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

        {/* Registration Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Register New Visitor</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.visitor_name}
                      onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Full name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.visitor_phone}
                        onChange={(e) => setFormData({ ...formData, visitor_phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.visitor_email}
                        onChange={(e) => setFormData({ ...formData, visitor_email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Email address"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Purpose *</label>
                    <input
                      type="text"
                      required
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="e.g., Social visit, Business meeting"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expected Arrival *</label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.expected_arrival}
                        onChange={(e) => setFormData({ ...formData, expected_arrival: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expected Departure</label>
                      <input
                        type="datetime-local"
                        value={formData.expected_departure}
                        onChange={(e) => setFormData({ ...formData, expected_departure: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      rows={3}
                      placeholder="Any additional information"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetail && selectedVisitor && (
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
                      setShowDetail(false);
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
