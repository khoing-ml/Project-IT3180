"use client";

import React, { useEffect, useState } from "react";
import { accessCardAPI, userAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { AccessCard } from "@/types/access";
import { AlertCircle, Plus, Eye, Trash2, Edit, Lock, Unlock } from "lucide-react";

export default function AccessControlPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [cards, setCards] = useState<AccessCard[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCard, setSelectedCard] = useState<AccessCard | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'lost' | 'blocked'>('all');
  const [formData, setFormData] = useState({
    resident_id: '',
    card_number: '',
    card_type: 'resident',
    expiry_date: '',
    notes: ''
  });

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'manager'))) {
      router.push('/unauthorized');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'manager')) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [cardsData, residentsData] = await Promise.all([
        accessCardAPI.getAll(),
        userAPI.getAll()
      ]);
      setCards(cardsData);
      setResidents(residentsData.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.resident_id || !formData.card_number) {
      setError('Resident and Card Number are required');
      return;
    }

    try {
      const cardDataToSend = {
        ...formData,
        resident_id: formData.resident_id,
        card_number: formData.card_number,
        card_type: formData.card_type as 'resident' | 'guest' | 'staff',
        expiry_date: formData.expiry_date || undefined,
        notes: formData.notes || undefined
      };

      await accessCardAPI.create(cardDataToSend);
      
      // Reset form
      setFormData({
        resident_id: '',
        card_number: '',
        card_type: 'resident',
        expiry_date: '',
        notes: ''
      });
      setShowModal(false);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create card');
    }
  };

  const handleStatusUpdate = async (cardId: string, newStatus: 'active' | 'inactive' | 'lost' | 'blocked') => {
    try {
      await accessCardAPI.updateStatus(cardId, newStatus);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update card status');
    }
  };

  const handleDelete = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card record?')) return;
    try {
      await accessCardAPI.delete(cardId);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete card');
    }
  };

  const filteredCards = cards.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'lost':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'blocked':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Unlock className="w-5 h-5 text-green-500" />;
      case 'blocked':
        return <Lock className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Access Control</h1>
            <p className="text-gray-600">Manage resident access cards</p>
          </div>
          <button
            onClick={() => {
              setIsEditMode(false);
              setFormData({
                resident_id: '',
                card_number: '',
                card_type: 'resident',
                expiry_date: '',
                notes: ''
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
          >
            <Plus className="w-5 h-5" />
            Issue New Card
          </button>
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
          {(['all', 'active', 'inactive', 'lost', 'blocked'] as const).map((f) => (
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
                ({filteredCards.length})
              </span>
            </button>
          ))}
        </div>

        {/* Cards Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {filteredCards.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No cards found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Card Number</th>
                    <th className="px-6 py-4 text-left font-semibold">Resident</th>
                    <th className="px-6 py-4 text-left font-semibold">Type</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Issued Date</th>
                    <th className="px-6 py-4 text-left font-semibold">Expiry</th>
                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCards.map((card) => (
                    <tr key={card.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-gray-900">{card.card_number}</td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{card.resident?.full_name}</div>
                        <div className="text-sm text-gray-500">Apt #{card.resident?.apartment_number}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {card.card_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(card.status)}`}>
                          {getStatusIcon(card.status)}
                          <span className="font-medium text-sm">{card.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(card.issued_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {card.expiry_date ? new Date(card.expiry_date).toLocaleDateString() : 'No expiry'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedCard(card);
                              setIsEditMode(true);
                            }}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                            title="View details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {card.status !== 'blocked' && (
                            <button
                              onClick={() => handleStatusUpdate(card.id, 'blocked')}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                              title="Block card"
                            >
                              <Lock className="w-5 h-5" />
                            </button>
                          )}
                          {card.status === 'blocked' && (
                            <button
                              onClick={() => handleStatusUpdate(card.id, 'active')}
                              className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                              title="Activate card"
                            >
                              <Unlock className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(card.id)}
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

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {isEditMode ? 'Card Details' : 'Issue New Access Card'}
                </h2>
                
                {!isEditMode ? (
                  <form onSubmit={handleCreateCard} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Resident *</label>
                      <select
                        required
                        value={formData.resident_id}
                        onChange={(e) => setFormData({ ...formData, resident_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="">Choose a resident...</option>
                        {residents.map((resident) => (
                          <option key={resident.id} value={resident.id}>
                            {resident.full_name} (Apt #{resident.apartment_number})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                      <input
                        type="text"
                        required
                        value={formData.card_number}
                        onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="e.g., RC-2024-0001"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Type</label>
                        <select
                          value={formData.card_type}
                          onChange={(e) => setFormData({ ...formData, card_type: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                          <option value="resident">Resident</option>
                          <option value="guest">Guest</option>
                          <option value="staff">Staff</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                        <input
                          type="date"
                          value={formData.expiry_date}
                          onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                        rows={3}
                        placeholder="Additional information"
                      />
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                      >
                        Issue Card
                      </button>
                    </div>
                  </form>
                ) : selectedCard ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                        <p className="text-lg font-mono font-semibold text-gray-900">{selectedCard.card_number}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(selectedCard.status)}`}>
                          {getStatusIcon(selectedCard.status)}
                          <span className="font-medium">{selectedCard.status}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Resident</label>
                        <p className="text-gray-900">{selectedCard.resident?.full_name}</p>
                        <p className="text-sm text-gray-500">Apt #{selectedCard.resident?.apartment_number}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Type</label>
                        <p className="text-gray-900">{selectedCard.card_type}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Issued Date</label>
                        <p className="text-gray-900">{new Date(selectedCard.issued_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                        <p className="text-gray-900">{selectedCard.expiry_date ? new Date(selectedCard.expiry_date).toLocaleDateString() : 'No expiry'}</p>
                      </div>
                      {selectedCard.notes && (
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                          <p className="text-gray-900">{selectedCard.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t">
                      <button
                        onClick={() => {
                          setShowModal(false);
                          setIsEditMode(false);
                          setSelectedCard(null);
                        }}
                        className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
