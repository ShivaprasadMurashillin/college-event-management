import { useState, useEffect } from 'react';
import api from '../services/api';

const FeedbackModal = ({ event, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const response = await api.get(`/feedback/my/${event.id}`);
        if (response.data.success && response.data.data) {
          setExistingFeedback(response.data.data);
          setRating(response.data.data.rating);
          setComment(response.data.data.comment || '');
          setIsAnonymous(response.data.data.is_anonymous);
        }
      } catch (error) {
        // No existing feedback
      }
    };
    fetchExisting();
  }, [event.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/feedback', {
        event_id: event.id,
        rating,
        comment,
        is_anonymous: isAnonymous
      });

      if (response.data.success) {
        onSubmit && onSubmit(response.data.data);
        onClose();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const StarRating = () => (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="text-4xl focus:outline-none transition-transform hover:scale-110"
        >
          <span className={
            (hoverRating || rating) >= star
              ? 'text-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
          }>
            ★
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {existingFeedback ? 'Update Feedback' : 'Rate Event'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
              {event.title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              How was your experience?
            </p>
            <StarRating />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent!'}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comments (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Share your experience..."
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Submit anonymously
              </span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : existingFeedback ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
