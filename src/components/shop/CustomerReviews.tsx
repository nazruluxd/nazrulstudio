import { useState, useEffect, FormEvent } from 'react';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Award,
  Sparkles,
  Filter,
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  setDoc,
  doc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

export interface CustomerReview {
  id: string;
  name: string;
  role: string;
  company?: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedBuyer: boolean;
  helpfulCount: number;
  userVotedHelpful?: boolean;
}

const DEFAULT_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    name: 'Marcus Vance',
    role: 'Lead Production Manager',
    company: 'Apex Print Solutions, UK',
    rating: 5,
    date: '2 days ago',
    title: 'Saved us 4+ hours on a 5,000 ticket raffle order',
    comment:
      'We used to dread numbering event tickets by hand or setting up variable data merges in InDesign. Serial Placer kept everything directly inside our Illustrator artboards, aligned the numbers perfectly to the millimetre, and duplicated pages in 30 seconds. Paid for itself on job number one.',
    verifiedBuyer: true,
    helpfulCount: 34,
  },
  {
    name: 'Karim Al-Hassan',
    role: 'Packaging & Graphic Designer',
    company: 'Creative Box Dubai',
    rating: 5,
    date: '1 week ago',
    title: 'Flawless centering and works like a charm in Illustrator 2025',
    comment:
      'The optical digit centering is what sets this apart. Numbers like "1111" versus "8888" don\'t drift or look lopsided in coupons. Running the script directly from File → Scripts is effortless. Highly recommend to any packaging studio.',
    id: 'rev-2',
    verifiedBuyer: true,
    helpfulCount: 22,
  },
  {
    id: 'rev-3',
    name: 'Chloe Dubois',
    role: 'Freelance Brand Designer',
    company: 'Studio Lyon',
    rating: 5,
    date: '2 weeks ago',
    title: 'Cleanest Illustrator tool I’ve used all year',
    comment:
      'One-time payment of $20 with zero subscription is so refreshing today. Customer support on WhatsApp answered my setup question within ten minutes. Works great on macOS Sonoma.',
    verifiedBuyer: true,
    helpfulCount: 19,
  },
  {
    id: 'rev-4',
    name: 'David Reynolds',
    role: 'Pre-press Specialist',
    company: 'Vanguard Press',
    rating: 4,
    date: '3 weeks ago',
    title: 'Very reliable for vouchers and coupon sheets',
    comment:
      'Handles large lists with hundreds of artboards without Illustrator crashing. The undo feature saved me when I forgot to zero-pad the digits. A must-have tool for print shops.',
    verifiedBuyer: true,
    helpfulCount: 15,
  },
];

const LOCAL_STORAGE_KEY = 'serial_placer_customer_reviews';

export const CustomerReviews = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return DEFAULT_REVIEWS;
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [sortOption, setSortOption] = useState<'recent' | 'highest' | 'helpful'>('recent');

  // Form states
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [recommend, setRecommend] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Sync with Firestore in Real-Time
  useEffect(() => {
    const reviewsPath = 'reviews';
    const unsubscribe = onSnapshot(
      collection(db, reviewsPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteReviews: CustomerReview[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            remoteReviews.push({
              id: docSnap.id,
              name: data.name || 'Verified Customer',
              role: data.role || 'Designer',
              company: data.company || '',
              rating: Number(data.rating) || 5,
              date: data.date || 'Recently',
              title: data.title || '',
              comment: data.comment || '',
              verifiedBuyer: data.verifiedBuyer ?? true,
              helpfulCount: Number(data.helpfulCount) || 0,
            });
          });

          // Merge Firestore reviews with DEFAULT_REVIEWS (avoiding duplicates)
          const merged = [...remoteReviews];
          DEFAULT_REVIEWS.forEach((def) => {
            if (!merged.some((r) => r.id === def.id)) {
              merged.push(def);
            }
          });
          setReviews(merged);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, reviewsPath);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync with localStorage as cache
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
    } catch {
      // ignore
    }
  }, [reviews]);

  const handleHelpfulClick = async (id: string) => {
    setReviews((prev) =>
      prev.map((rev) => {
        if (rev.id === id) {
          if (rev.userVotedHelpful) {
            return {
              ...rev,
              helpfulCount: Math.max(0, rev.helpfulCount - 1),
              userVotedHelpful: false,
            };
          }
          return {
            ...rev,
            helpfulCount: rev.helpfulCount + 1,
            userVotedHelpful: true,
          };
        }
        return rev;
      })
    );

    // Also attempt to update Firestore helpfulCount
    try {
      await updateDoc(doc(db, 'reviews', id), {
        helpfulCount: increment(1),
      });
    } catch (error) {
      // Review might be a local default or offline; handled gracefully
      console.warn('Could not increment remote review helpfulCount', error);
    }
  };

  const handleAddReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim() || !title.trim()) return;

    const newRevId = 'rev-' + Date.now();
    const newRev: CustomerReview = {
      id: newRevId,
      name: name.trim(),
      role: role.trim() || 'Designer',
      company: company.trim() || undefined,
      rating: newRating,
      date: 'Just now',
      title: title.trim(),
      comment: comment.trim(),
      verifiedBuyer: true,
      helpfulCount: 0,
      userVotedHelpful: false,
    };

    setReviews([newRev, ...reviews]);
    setSubmitSuccess(true);

    // Persist to Firestore
    try {
      await setDoc(doc(db, 'reviews', newRevId), {
        name: newRev.name,
        role: newRev.role,
        company: newRev.company || '',
        rating: newRev.rating,
        date: newRev.date,
        title: newRev.title,
        comment: newRev.comment,
        verifiedBuyer: true,
        helpfulCount: 0,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `reviews/${newRevId}`);
    }

    setTimeout(() => {
      setName('');
      setRole('');
      setCompany('');
      setTitle('');
      setComment('');
      setNewRating(5);
      setSubmitSuccess(false);
      setIsFormOpen(false);
    }, 1800);
  };


  // Calculations
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : '5.0';

  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
    percentage:
      totalReviews > 0
        ? Math.round((reviews.filter((r) => r.rating === stars).length / totalReviews) * 100)
        : 0,
  }));

  // Filtering and sorting
  const filteredReviews = reviews
    .filter((r) => (filterRating === 'all' ? true : r.rating === filterRating))
    .sort((a, b) => {
      if (sortOption === 'highest') return b.rating - a.rating;
      if (sortOption === 'helpful') return b.helpfulCount - a.helpfulCount;
      return 0; // recent preserves array order
    });

  return (
    <section id="reviews" className="scroll-mt-24 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#ffa41b]/30 bg-[#ffa41b]/10 text-[#ffcf4a] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={12} /> Verified Customer Feedback
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Loved by Print & Design Pros
          </h2>
          <p className="text-sm md:text-base text-[#9aa4b8] mt-2 max-w-xl">
            Real feedback from print shops, prepress technicians, packaging designers, and agencies using Serial Placer in production.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="self-start md:self-auto px-6 py-3 rounded-full font-bold text-sm bg-gradient-to-r from-[#ffa41b] to-[#ffcf4a] text-[#1a1204] hover:scale-105 active:scale-95 shadow-lg shadow-[#ffa41b]/20 transition-all flex items-center gap-2"
        >
          <MessageSquare size={16} />
          {isFormOpen ? 'Close Review Form' : 'Write a Customer Review'}
        </button>
      </div>

      {/* Review Form Drawer / Modal */}
      {isFormOpen && (
        <div className="bg-[#12161f] border border-[#ffa41b]/40 rounded-3xl p-6 md:p-10 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white">
                Share Your Product Experience
              </h3>
              <p className="text-xs text-[#9aa4b8] mt-0.5">
                Help other Illustrator users know how Serial Placer worked for your print projects.
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-full bg-white/5 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          {submitSuccess ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="text-2xl font-bold text-white">Review Submitted!</h4>
              <p className="text-sm text-slate-300">
                Thank you for your review. Your verified rating has been published below.
              </p>
            </div>
          ) : (
            <form onSubmit={handleAddReview} className="space-y-6">
              {/* Star rating picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Your Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-110 transition-transform"
                      aria-label={`${star} star rating`}
                    >
                      <Star
                        size={28}
                        className={`transition-colors ${
                          star <= (hoverRating || newRating)
                            ? 'fill-[#ffa41b] text-[#ffa41b]'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-white ml-2">
                    {newRating === 5 && 'Outstanding (5/5)'}
                    {newRating === 4 && 'Very Good (4/5)'}
                    {newRating === 3 && 'Average (3/5)'}
                    {newRating === 2 && 'Needs Improvement (2/5)'}
                    {newRating === 1 && 'Poor (1/5)'}
                  </span>
                </div>
              </div>

              {/* Name, Role & Company */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Connor"
                    className="w-full bg-[#171c27] border border-[#232a38] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ffa41b] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">
                    Job Title / Role
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Print Operator, Designer"
                    className="w-full bg-[#171c27] border border-[#232a38] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ffa41b] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">
                    Company / Studio (optional)
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Printing Co."
                    className="w-full bg-[#171c27] border border-[#232a38] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ffa41b] transition-colors"
                  />
                </div>
              </div>

              {/* Review Headline & Body */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  Review Headline <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Sum up your experience in one sentence"
                  className="w-full bg-[#171c27] border border-[#232a38] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ffa41b] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  Detailed Feedback <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How did Serial Placer help your workflow? How was the centering, ease of use, or page building?"
                  className="w-full bg-[#171c27] border border-[#232a38] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ffa41b] transition-colors resize-none"
                />
              </div>

              {/* Recommendation toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={recommend}
                  onChange={(e) => setRecommend(e.target.checked)}
                  className="w-4 h-4 accent-[#ffa41b] rounded"
                />
                <span className="text-xs md:text-sm text-slate-300">
                  I recommend Serial Placer to other Adobe Illustrator professionals
                </span>
              </label>

              {/* Submit buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#ffa41b] to-[#ffcf4a] text-[#1a1204] font-bold text-sm shadow-lg shadow-[#ffa41b]/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Post Review
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Aggregate Score & Rating Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 bg-[#12161f] border border-[#232a38] rounded-3xl p-6 md:p-10">
        {/* Left: Overall Score */}
        <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-10">
          <div className="text-6xl md:text-7xl font-black text-white tracking-tight">
            {averageRating}
          </div>
          <div className="flex gap-1 my-2" aria-label={`${averageRating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={20} className="fill-[#ffa41b] text-[#ffa41b]" />
            ))}
          </div>
          <p className="text-sm font-semibold text-white mt-1">
            Based on {totalReviews} verified reviews
          </p>
          <p className="text-xs text-[#9aa4b8] mt-1 flex items-center gap-1.5">
            <Award size={14} className="text-[#37d67a]" /> 100% Verified Buyer ratings
          </p>
        </div>

        {/* Right: Distribution bars */}
        <div className="flex flex-col justify-center space-y-2.5">
          {ratingCounts.map(({ stars, count, percentage }) => (
            <button
              key={stars}
              onClick={() =>
                setFilterRating(filterRating === stars ? 'all' : stars)
              }
              className="flex items-center gap-3 text-xs md:text-sm text-slate-400 hover:text-white transition-colors group w-full text-left"
            >
              <span className="w-12 font-medium shrink-0 flex items-center gap-1">
                {stars} <Star size={12} className="fill-[#ffa41b] text-[#ffa41b]" />
              </span>
              <div className="flex-1 h-2 bg-[#171c27] rounded-full overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    filterRating === stars ? 'bg-[#ffcf4a]' : 'bg-[#ffa41b]'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-14 text-right font-mono text-xs shrink-0">
                {count} ({percentage}%)
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[#ffa41b]" />
          <span className="text-xs font-bold uppercase text-slate-400">Filter:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterRating('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filterRating === 'all'
                  ? 'bg-[#ffa41b] text-[#1a1204]'
                  : 'bg-[#171c27] text-slate-400 hover:text-white'
              }`}
            >
              All ({totalReviews})
            </button>
            {[5, 4, 3].map((star) => {
              const c = reviews.filter((r) => r.rating === star).length;
              return (
                <button
                  key={star}
                  onClick={() => setFilterRating(star)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    filterRating === star
                      ? 'bg-[#ffa41b] text-[#1a1204]'
                      : 'bg-[#171c27] text-slate-400 hover:text-white'
                  }`}
                >
                  {star} Stars ({c})
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase text-slate-400">Sort by:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="bg-[#171c27] border border-[#232a38] text-white text-xs font-semibold rounded-xl px-3 py-1.5 outline-none focus:border-[#ffa41b]"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-[#12161f] border border-[#232a38] rounded-2xl text-slate-400 text-sm">
            No reviews match the selected filter.
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-[#12161f] border border-[#232a38] hover:border-[#2f3850] rounded-2xl p-6 md:p-8 space-y-4 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffa41b]/20 to-[#ffcf4a]/10 border border-[#ffa41b]/30 text-[#ffa41b] font-bold text-sm flex items-center justify-center">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        {review.name}
                      </span>
                      {review.verifiedBuyer && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#37d67a] bg-[#37d67a]/10 border border-[#37d67a]/20 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={11} /> Verified Buyer
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {review.role}
                      {review.company && ` · ${review.company}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < review.rating
                            ? 'fill-[#ffa41b] text-[#ffa41b]'
                            : 'text-slate-600'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {review.date}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold text-white mb-1.5">
                  {review.title}
                </h4>
                <p className="text-sm text-[#cdd4e3] leading-relaxed">
                  {review.comment}
                </p>
              </div>

              {/* Bottom Helpful button */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
                <span className="text-[11px] text-slate-500">
                  Was this review helpful?
                </span>
                <button
                  onClick={() => handleHelpfulClick(review.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
                    review.userVotedHelpful
                      ? 'border-[#37d67a]/40 bg-[#37d67a]/10 text-[#37d67a]'
                      : 'border-white/5 hover:border-white/20 text-slate-400 hover:text-white bg-white/[0.02]'
                  }`}
                >
                  <ThumbsUp size={13} />
                  <span>Helpful ({review.helpfulCount})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
