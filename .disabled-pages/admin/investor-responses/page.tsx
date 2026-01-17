"use client";
import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface FollowUpStats {
  total: number;
  responded: number;
  pending: number;
  responseRate: string;
  bySequence: {
    initial: number;
    first: number;
    second: number;
    final: number;
  };
}

export default function InvestorResponseDashboard() {
  const [stats, setStats] = useState<FollowUpStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/investor/follow-up-stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching follow-up stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const runFollowUpCheck = async () => {
    try {
      const response = await apiRequest('/api/investor/run-follow-up-check', { method: 'POST' });
      if (response.success) {
        alert('✅ Follow-up check completed! Any due follow-ups have been sent.');
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error running follow-up check:', error);
      alert('❌ Failed to run follow-up check');
    }
  };

  const markAsResponded = async () => {
    const email = prompt('Enter investor email to mark as responded:');
    if (!email) return;

    try {
      const response = await apiRequest('/api/investor/mark-responded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.success) {
        alert(`✅ Investor ${email} marked as responded!`);
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error marking investor as responded:', error);
      alert('❌ Failed to mark investor as responded');
    }
  };

  const initializeFollowUp = async () => {
    try {
      const response = await apiRequest('/api/investor/initialize-follow-up', { method: 'POST' });
      if (response.success) {
        alert('✅ Follow-up sequences initialized for all campaign investors!');
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error initializing follow-up:', error);
      alert('❌ Failed to initialize follow-up sequences');
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading investor response tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            📈 Investor Response Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Track investor deck responses and automated follow-up sequences</p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={initializeFollowUp}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-colors"
          >
            🚀 Initialize Follow-up System
          </button>
          <button
            onClick={runFollowUpCheck}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-colors"
          >
            ⚡ Run Follow-up Check Now
          </button>
          <button
            onClick={markAsResponded}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-colors"
          >
            ✅ Mark Investor as Responded
          </button>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-colors disabled:opacity-50"
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh Stats'}
          </button>
        </div>

        {stats ? (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">{stats.total}</div>
                <div className="text-gray-600 font-medium">Total Investors</div>
                <div className="text-sm text-gray-500 mt-1">Campaign recipients</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.responded}</div>
                <div className="text-gray-600 font-medium">Responded</div>
                <div className="text-sm text-gray-500 mt-1">Active conversations</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{stats.pending}</div>
                <div className="text-gray-600 font-medium">Pending Response</div>
                <div className="text-sm text-gray-500 mt-1">Awaiting follow-up</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{stats.responseRate}</div>
                <div className="text-gray-600 font-medium">Response Rate</div>
                <div className="text-sm text-gray-500 mt-1">Current conversion</div>
              </div>
            </div>

            {/* Follow-up Sequence Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                📅 Follow-up Sequence Status
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📤</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{stats.bySequence.initial}</div>
                  <div className="text-gray-600 font-medium">Initial Deck Sent</div>
                  <div className="text-sm text-gray-500">Awaiting first follow-up</div>
                </div>

                <div className="text-center">
                  <div className="bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📬</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.bySequence.first}</div>
                  <div className="text-gray-600 font-medium">First Follow-up</div>
                  <div className="text-sm text-gray-500">7 days after deck</div>
                </div>

                <div className="text-center">
                  <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📨</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{stats.bySequence.second}</div>
                  <div className="text-gray-600 font-medium">Second Follow-up</div>
                  <div className="text-sm text-gray-500">14 days after deck</div>
                </div>

                <div className="text-center">
                  <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📮</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">{stats.bySequence.final}</div>
                  <div className="text-gray-600 font-medium">Final Follow-up</div>
                  <div className="text-sm text-gray-500">21 days after deck</div>
                </div>
              </div>
            </div>

            {/* Follow-up Schedule Info */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                ⏰ Automated Follow-up Schedule
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="font-semibold text-indigo-600 mb-2">📅 Week 1 Follow-up</div>
                  <div className="text-sm text-gray-600">
                    • Updates on new traction<br/>
                    • Offers additional information<br/>
                    • Calendar link for discussion
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="font-semibold text-purple-600 mb-2">📅 Week 2 Follow-up</div>
                  <div className="text-sm text-gray-600">
                    • Partnership announcements<br/>
                    • Updated financial metrics<br/>
                    • Final investment opportunity
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="font-semibold text-gray-600 mb-2">📅 Week 3 Final</div>
                  <div className="text-sm text-gray-600">
                    • Thank you message<br/>
                    • Round closing notification<br/>
                    • Future collaboration opportunity
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-white rounded-lg border border-indigo-200">
                <div className="font-medium text-indigo-700 mb-2">🤖 Automated System Features:</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• ⏰ <strong>Daily 9 AM Check:</strong> Automatically sends due follow-ups</li>
                  <li>• 📧 <strong>Gmail API Integration:</strong> Professional email delivery</li>
                  <li>• 🎯 <strong>Smart Tracking:</strong> Removes responded investors from sequences</li>
                  <li>• 📊 <strong>Real-time Stats:</strong> Live response rate monitoring</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Follow-up Data Yet</h3>
            <p className="text-gray-600 mb-6">Initialize the follow-up system to start tracking investor responses.</p>
            <button
              onClick={initializeFollowUp}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg transition-colors"
            >
              🚀 Initialize Follow-up System
            </button>
          </div>
        )}
      </div>
    </div>
  );
}