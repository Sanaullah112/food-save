import React, { useState, useEffect } from 'react';
import { FaStar, FaCommentAlt, FaRegListAlt, FaUtensils, FaBox, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import Swal from 'sweetalert2'; // Beautiful alert popups
import API from '../../utils/api'; // Replace with your standard axios instance path
import Navbar from '../../components/Navbar';

const Feedback = () => {
  // Form States
  const [donations, setDonations] = useState([]);
  const [selectedFood, setSelectedFood] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');
  
  // History and Loading States
  const [history, setHistory] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const feedbackTypes = ['Food Quality', 'Packaging Integrity', 'Delivery Timing', 'Other'];

  // Fetch donations for dropdown and user history on mount
  useEffect(() => {
    fetchDonationOptions();
    fetchFeedbackHistory();
  }, []);

 const fetchDonationOptions = async () => {
  try {
    setLoadingDonations(true);
    
    // ─── UPDATED THIS LINE TO MATCH THE NEW ROUTE ───
    const { data } = await API.get('/food/options'); 
    
    // Adjust based on your model field naming. 
    // If your model uses 'foodName', this remains perfectly correct!
    setDonations(data || []);
    
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error Fetching Donations',
      text: err.response?.data?.message || 'Could not load your donation list. Please reload.',
      confirmButtonColor: '#3085d6'
    });
  } finally {
    setLoadingDonations(false);
  }
};

  const fetchFeedbackHistory = async () => {
    try {
      const { data } = await API.get('/feedback/history');
      setHistory(data || []);
    } catch (err) {
      console.error('Could not fetch feedback history', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFood || !feedbackType || rating === 0 || !comments.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please complete all form fields and provide a rating star count.',
      });
      return;
    }

    try {
      setSubmitting(true);
      const submissionData = {
        foodId: selectedFood,
        feedbackType,
        rating,
        comments
      };

      const { data } = await API.post('/food/feedback', submissionData);

      Swal.fire({
        icon: 'success',
        title: 'Thank You!',
        text: 'Your feedback has been submitted successfully.',
        timer: 2000,
        showConfirmButton: false
      });

      // Clear Form layout
      setSelectedFood('');
      setFeedbackType('');
      setRating(0);
      setComments('');

      // Refresh history stack instantly
      setHistory([data, ...history]);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.response?.data?.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Maps types to specific layout icons
  const getTypeIcon = (type) => {
    switch (type) {
      case 'Food Quality': return <FaUtensils className="text-orange-500" />;
      case 'Packaging Integrity': return <FaBox className="text-blue-500" />;
      case 'Delivery Timing': return <FaClock className="text-green-500" />;
      default: return <FaExclamationTriangle className="text-gray-500" />;
    }
  };
  

  return (
     <div style={{minHeight:'100vh',background:'#F4F6FB',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
     
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
          <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.au{animation:fadeUp 0.5s ease both;opacity:0}.d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}.rcard{background:white;border-radius:18px;border:1px solid #D8E2F0;padding:24px;transition:all 0.3s ease;position:relative;overflow:hidden}.rcard::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(135deg,#D4A017,#F0C040);border-radius:18px 0 0 18px}.rcard:hover{transform:translateY(-3px);box-shadow:0 12px 36px rgba(27,58,107,0.1);border-color:#D4A017}`}</style>
          <Navbar/>
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px', fontWeight: '700' }}>Provide Feedback</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '40px' }}>
        
        {/* LEFT COLUMN: FEEDBACK FORM */}
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSubmit}>
            
            {/* Donation Dropdown Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#34495e' }}>Select Donation Item</label>
              <select 
                value={selectedFood} 
                onChange={(e) => setSelectedFood(e.target.value)}
                disabled={loadingDonations}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', background: '#f9f9f9', fontSize: '15px' }}
              >
                <option value="">{loadingDonations ? 'Loading donations...' : '-- Choose a Donation --'}</option>
                {donations.map((item) => (
                  <option key={item._id} value={item._id}>{item.foodName}</option>
                ))}
              </select>
            </div>

            {/* Feedback Type Dropdown */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#34495e' }}>Feedback Category</label>
              <select 
                value={feedbackType} 
                onChange={(e) => setFeedbackType(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', background: '#f9f9f9', fontSize: '15px' }}
              >
                <option value="">-- Choose a Category --</option>
                {feedbackTypes.map((type, idx) => (
                  <option key={idx} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Star Rating Mechanic */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#34495e' }}>Rating</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1;
                  return (
                    <label key={ratingValue} style={{ cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="rating" 
                        value={ratingValue} 
                        onClick={() => setRating(ratingValue)}
                        style={{ display: 'none' }}
                      />
                      <FaStar 
                        size={28} 
                        style={{ transition: 'color 0.15s ease' }}
                        color={ratingValue <= (hoverRating || rating) ? '#ffc107' : '#e4e5e9'}
                        onMouseEnter={() => setHoverRating(ratingValue)}
                        onMouseLeave={() => setHoverRating(0)}
                      />
                    </label>
                  );
                })}
                {rating > 0 && <span style={{ marginLeft: '10px', fontWeight: 'bold', color: '#555' }}>{rating} / 5</span>}
              </div>
            </div>

            {/* Comments Text Area */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#34495e' }}>Your Comments</label>
              <div style={{ position: 'relative' }}>
                <FaCommentAlt style={{ position: 'absolute', left: '12px', top: '15px', color: '#aaa' }} />
                <textarea 
                  rows="4"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Share details of your experience..."
                  style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '15px', resize: 'vertical' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              style={{ width: '100%', padding: '14px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.target.style.background = '#27ae60'}
              onMouseOut={(e) => e.target.style.background = '#2ecc71'}
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: FEEDBACK HISTORY LIST */}
        <div style={{ background: '#f8f9fa', padding: '30px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
          <h3 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaRegListAlt /> Feedback History
          </h3>
          
          <div style={{ maxHeight: '460px', overflowY: 'auto', paddingRight: '5px' }}>
            {history.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#7f8c8d', marginTop: '40px' }}>You haven't submitted any feedback yet.</p>
            ) : (
              history.map((item) => (
                <div key={item._id} style={{ background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderLeft: '4px solid #2ecc71' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ color: '#2c3e50', fontSize: '16px' }}>{item.foodId?.foodName || 'Deleted Donation'}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#7f8c8d', marginTop: '2px' }}>
                        {getTypeIcon(item.feedbackType)}
                        <span>{item.feedbackType}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', color: '#ffc107' }}>
                      {[...Array(item.rating)].map((_, i) => <FaStar key={i} size={14} />)}
                    </div>
                  </div>
                  <p style={{ margin: '8px 0 0 0', color: '#555', fontSize: '14px', lineHeight: '1.4' }}>
                    "{item.comments}"
                  </p>
                  <small style={{ display: 'block', textAlign: 'right', color: '#bbb', marginTop: '5px' }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </small>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
    </div>
  );
};

export default Feedback;