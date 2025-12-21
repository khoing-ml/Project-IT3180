"use client";

import React, { useEffect, useState } from "react";
import { accessCardAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { AccessCard } from "@/types/access";
import { AlertCircle, Eye, AlertTriangle } from "lucide-react";

export default function MyCardsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [cards, setCards] = useState<AccessCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<AccessCard | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [user]);

  const fetchCards = async () => {
    try {
      setIsLoading(true);
      const data = await accessCardAPI.getAll();
      setCards(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportLost = async (cardId: string) => {
    if (!confirm('Are you sure you want to report this card as lost? This action cannot be undone.')) return;
    try {
      await accessCardAPI.reportLost(cardId);
      await fetchCards();
      setShowDetail(false);
      setSelectedCard(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to report card as lost');
    }
  };

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
    if (status === 'blocked' || status === 'lost') {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
    return <AlertCircle className="w-5 h-5 text-gray-500" />;
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
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Access Cards</h1>
          <p className="text-gray-600">View and manage your access cards</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Cards Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No access cards assigned</p>
                <p className="text-sm text-gray-400 mt-2">Contact the building management to request a card</p>
              </div>
            </div>
          ) : (
            cards.map((card) => (
              <div key={card.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <div className={`h-2 ${card.status === 'active' ? 'bg-green-500' : card.status === 'blocked' ? 'bg-red-500' : card.status === 'lost' ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Card {card.card_type}</h3>
                      <p className="text-sm text-gray-500 mt-1">Number: {card.card_number}</p>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(card.status)}`}>
                      {getStatusIcon(card.status)}
                      <span className="font-medium text-sm">{card.status}</span>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Issued:</span>
                      <span className="font-medium text-gray-900">{new Date(card.issued_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expires:</span>
                      <span className="font-medium text-gray-900">
                        {card.expiry_date ? new Date(card.expiry_date).toLocaleDateString() : 'No expiry'}
                      </span>
                    </div>
                    {card.reason_for_status && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reason:</span>
                        <span className="font-medium text-red-600">{card.reason_for_status}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedCard(card);
                        setShowDetail(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </button>
                    {card.status !== 'lost' && card.status !== 'blocked' && (
                      <button
                        onClick={() => handleReportLost(card.id)}
                        className="flex-1 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors font-medium"
                        title="Report card as lost"
                      >
                        Lost
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Box */}
        {cards.length > 0 && (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
            <h3 className="font-semibold text-blue-900 mb-2">Card Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Keep your card in a safe place</li>
              <li>✓ Report lost or damaged cards immediately</li>
              <li>✓ Do not share your card with others</li>
              <li>✓ Contact management for card replacement</li>
            </ul>
          </div>
        )}

        {/* Detail Modal */}
        {showDetail && selectedCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Card Details</h2>
                
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <p className="text-gray-900 capitalize">{selectedCard.card_type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Issued Date</label>
                      <p className="text-gray-900">{new Date(selectedCard.issued_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <p className="text-gray-900">{selectedCard.expiry_date ? new Date(selectedCard.expiry_date).toLocaleDateString() : 'No expiry'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Issued By</label>
                      <p className="text-gray-900">{selectedCard.issuer?.full_name || 'System'}</p>
                    </div>
                    {selectedCard.reason_for_status && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status Reason</label>
                        <p className="text-red-600">{selectedCard.reason_for_status}</p>
                      </div>
                    )}
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
                        setShowDetail(false);
                        setSelectedCard(null);
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
