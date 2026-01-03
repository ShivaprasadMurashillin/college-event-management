import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Referrals = () => {
  const { user } = useAuth();
  const [referralData, setReferralData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [rewardsData, setRewardsData] = useState({ badges: [] });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch data in parallel but handle each individually
      const [myReferralsRes, leaderboardRes, rewardsRes] = await Promise.allSettled([
        api.get('/referrals/my'),
        api.get('/referrals/leaderboard'),
        api.get('/referrals/rewards')
      ]);

      // Handle my referrals
      if (myReferralsRes.status === 'fulfilled' && myReferralsRes.value?.data?.data) {
        const myData = myReferralsRes.value.data.data;
        setReferralData({
          referrals: myData.referrals || [],
          stats: myData.stats || { total_points: 0, level: 'bronze', referral_count: 0 },
          referral_code: myData.referrals?.[0]?.referral_code || null
        });
      } else {
        setReferralData({
          referrals: [],
          stats: { total_points: 0, level: 'bronze', referral_count: 0 },
          referral_code: null
        });
      }

      // Handle leaderboard
      if (leaderboardRes.status === 'fulfilled' && leaderboardRes.value?.data?.data) {
        setLeaderboard(leaderboardRes.value.data.data);
      } else {
        setLeaderboard([]);
      }

      // Handle rewards - backend returns object with badges array
      if (rewardsRes.status === 'fulfilled' && rewardsRes.value?.data?.data) {
        setRewardsData(rewardsRes.value.data.data);
      } else {
        setRewardsData({ badges: [] });
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      // Set default values on error
      setReferralData({
        referrals: [],
        stats: { total_points: 0, level: 'bronze', referral_count: 0 },
        referral_code: null
      });
      setLeaderboard([]);
      setRewardsData({ badges: [] });
    } finally {
      setLoading(false);
    }
  };

  const generateReferralLink = async () => {
    try {
      const response = await api.post('/referrals/generate');
      if (response.data.success) {
        setReferralData(prev => ({
          ...prev,
          referral_code: response.data.data.code,
          referral_link: response.data.data.link
        }));
      }
    } catch (error) {
      console.error('Error generating referral link:', error);
      alert('Failed to generate referral link');
    }
  };

  const copyToClipboard = () => {
    const link = referralData?.referral_link || 
      `${window.location.origin}/signup?ref=${referralData?.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelBadge = (level) => {
    const badges = {
      bronze: { color: 'bg-amber-600', icon: '🥉' },
      silver: { color: 'bg-gray-400', icon: '🥈' },
      gold: { color: 'bg-yellow-500', icon: '🥇' },
      platinum: { color: 'bg-purple-500', icon: '💎' }
    };
    return badges[level] || badges.bronze;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Referrals & Rewards
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-blue-600">
              {referralData?.stats?.referral_count || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Referrals</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-green-600">
              {referralData?.referrals?.length || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Links</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-purple-600">
              {referralData?.stats?.total_points || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Points Earned</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{getLevelBadge(referralData?.stats?.level || 'bronze').icon}</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                {referralData?.stats?.level || 'Bronze'}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your Level</p>
          </div>
        </div>

        {/* Referral Link Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-6">
          <h2 className="text-xl font-bold mb-2">Share Your Referral Link</h2>
          <p className="opacity-90 mb-4">
            Invite friends and earn points when they join and register for events!
          </p>
          
          {referralData?.referral_code ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-white/20 rounded-lg px-4 py-3 font-mono text-sm backdrop-blur-sm overflow-hidden">
                <span className="truncate block">
                  {`${window.location.origin}/signup?ref=${referralData.referral_code}`}
                </span>
              </div>
              <button
                onClick={copyToClipboard}
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy Link
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={generateReferralLink}
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Generate Referral Link
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Leaderboard */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                🏆 Leaderboard
              </h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {leaderboard.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No referrals yet. Be the first!
                </div>
              ) : (
                leaderboard.slice(0, 10).map((entry, index) => (
                  <div
                    key={entry.id || index}
                    className={`flex items-center gap-4 p-4 ${
                      entry.id === user?.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {entry.name}
                        {entry.id === user?.id && (
                          <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(You)</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {entry.referral_count} referrals
                      </p>
                    </div>
                    <span className="text-lg font-bold text-purple-600">
                      {entry.total_points} pts
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Rewards / Badges */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                🎁 Your Badges
              </h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {(!rewardsData.badges || rewardsData.badges.length === 0) ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <span className="text-4xl mb-2 block">🎁</span>
                  No badges yet. Start referring to earn!
                </div>
              ) : (
                rewardsData.badges.map((badge, index) => (
                  <div key={index} className="flex items-center gap-4 p-4">
                    <span className="text-3xl">{badge.icon || '🏅'}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {badge.name}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center">
              <span className="text-4xl mb-3 block">🔗</span>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Share Your Link</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Copy and share your unique referral link with friends
              </p>
            </div>
            <div className="text-center">
              <span className="text-4xl mb-3 block">👥</span>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Friends Sign Up</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                When they register using your link, you get 10 points
              </p>
            </div>
            <div className="text-center">
              <span className="text-4xl mb-3 block">🎉</span>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Earn Rewards</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Earn 25 more points when they register for an event
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Level Progression</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { level: 'Bronze', min: 0, icon: '🥉' },
                { level: 'Silver', min: 100, icon: '🥈' },
                { level: 'Gold', min: 500, icon: '🥇' },
                { level: 'Platinum', min: 1000, icon: '💎' }
              ].map((tier) => (
                <div
                  key={tier.level}
                  className={`text-center p-3 rounded-lg ${
                    (referralData?.stats?.total_points || 0) >= tier.min
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                      : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <span className="text-2xl">{tier.icon}</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{tier.level}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{tier.min}+ pts</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referrals;
