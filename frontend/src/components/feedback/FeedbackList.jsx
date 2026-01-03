import { useState, useEffect } from 'react';
import api from '../services/api';

const FeedbackList = ({ eventId }) => {
  const [feedback, setFeedback] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedbackRes, analyticsRes] = await Promise.all([
          api.get(`/feedback/event/${eventId}`),
          api.get(`/feedback/analytics/${eventId}`)
        ]);

        setFeedback(feedbackRes.data.data || []);
        setAnalytics(analyticsRes.data.data || null);
      } catch (error) {
        console.error('Error fetching feedback:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const StarDisplay = ({ rating }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={rating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
        >
          ★
        </span>
      ))}
    </div>
  );

  const RatingBar = ({ label, count, total }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="w-6 text-gray-600 dark:text-gray-400">{label}</span>
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="w-8 text-right text-gray-500 dark:text-gray-400">{count}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Summary */}
      {analytics && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {analytics.average_rating?.toFixed(1) || 'N/A'}
                </span>
                <div>
                  <StarDisplay rating={Math.round(analytics.average_rating || 0)} />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {analytics.total_reviews} {analytics.total_reviews === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map(star => (
                <RatingBar
                  key={star}
                  label={`${star}★`}
                  count={analytics.distribution?.[`star_${star}`] || 0}
                  total={analytics.total_reviews}
                />
              ))}
            </div>
          </div>

          {/* Sentiment */}
          {analytics.sentiment && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-center gap-8 text-sm">
                <div className="text-center">
                  <span className="text-2xl">😊</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {analytics.sentiment.positive}% Positive
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-2xl">😐</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {analytics.sentiment.neutral}% Neutral
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-2xl">😞</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {analytics.sentiment.negative}% Negative
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feedback List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Reviews
        </h3>

        {feedback.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {item.is_anonymous ? '?' : (item.user_name?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.is_anonymous ? 'Anonymous' : item.user_name}
                      </p>
                      <StarDisplay rating={item.rating} />
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                {item.comment && (
                  <p className="text-gray-600 dark:text-gray-300 mt-2 pl-13">
                    {item.comment}
                  </p>
                )}

                {item.sentiment && (
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.sentiment === 'positive' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      item.sentiment === 'negative' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {item.sentiment}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackList;
