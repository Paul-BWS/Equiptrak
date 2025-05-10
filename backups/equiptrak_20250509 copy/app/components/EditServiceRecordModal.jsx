import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const EditServiceRecordModal = ({ serviceRecordId, onClose, onSave }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    certificate_number: '',
    equipment1_name: '',
    equipment1_serial: '',
    equipment2_name: '',
    equipment2_serial: '',
    equipment3_name: '',
    equipment3_serial: '',
    equipment4_name: '',
    equipment4_serial: '',
    equipment5_name: '',
    equipment5_serial: '',
    equipment6_name: '',
    equipment6_serial: '',
    service_date: new Date(),
    retest_date: new Date(new Date().setDate(new Date().getDate() + 364)),
    notes: '',
    engineer_id: '',
    status: 'Active'
  });

  // Helper function to get auth token
  const getAuthToken = () => {
    const storedUser = localStorage.getItem('equiptrak_user');
    if (!storedUser) return null;
    
    try {
      const userData = JSON.parse(storedUser);
      return userData.token || null;
    } catch (e) {
      console.error("Error parsing user data:", e);
      return null;
    }
  };

  // Get the headers with authentication
  const getAuthHeaders = () => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  useEffect(() => {
    if (!serviceRecordId) return;
    
    const fetchServiceRecord = async () => {
      try {
        setLoading(true);
        // Directly fetch the specific service record with auth headers
        const response = await fetch(`/api/service-records/${serviceRecordId}`, {
          headers: getAuthHeaders(),
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch service record');
        
        const data = await response.json();
        console.log("Service record loaded:", data);
        
        // Set form data with proper date formatting
        setFormData({
          ...data,
          service_date: data.service_date ? new Date(data.service_date) : new Date(),
          retest_date: data.retest_date ? new Date(data.retest_date) : calculateRetestDate(new Date(data.service_date))
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Error loading service record:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchServiceRecord();
  }, [serviceRecordId]);

  const calculateRetestDate = (serviceDate) => {
    const date = new Date(serviceDate);
    date.setDate(date.getDate() + 364);
    return date;
  };

  const handleDateChange = (date) => {
    // Calculate retest date as service date + 364 days
    const retestDate = calculateRetestDate(date);
    
    setFormData(prev => ({
      ...prev,
      service_date: date,
      retest_date: retestDate
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const response = await fetch(`/api/service-records/${serviceRecordId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to update service record');
      
      const updatedRecord = await response.json();
      console.log('Service record updated:', updatedRecord);
      
      if (onSave) onSave(updatedRecord);
      if (onClose) onClose();
    } catch (err) {
      console.error('Error updating service record:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Service Record</h2>
        
        {error && <div className="error-message">Error: {error}</div>}
        
        {loading ? (
          <p>Loading service record data...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="certificate_number">Certificate Number</label>
              <input
                type="text"
                id="certificate_number"
                name="certificate_number"
                value={formData.certificate_number || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="service_date">Service Date</label>
              <DatePicker
                id="service_date"
                selected={formData.service_date}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="retest_date">Retest Date</label>
              <DatePicker
                id="retest_date"
                selected={formData.retest_date}
                onChange={(date) => setFormData({...formData, retest_date: date})}
                dateFormat="dd/MM/yyyy"
                required
                disabled  // Make this read-only as it's calculated automatically
              />
            </div>
            
            {/* Equipment fields */}
            <div className="equipment-section">
              <h3>Equipment</h3>
              {[1, 2, 3, 4, 5, 6].map(index => (
                <div key={index} className="equipment-row">
                  <div className="form-group">
                    <label htmlFor={`equipment${index}_name`}>Equipment {index}</label>
                    <input
                      type="text"
                      id={`equipment${index}_name`}
                      name={`equipment${index}_name`}
                      value={formData[`equipment${index}_name`] || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`equipment${index}_serial`}>Serial Number</label>
                    <input
                      type="text"
                      id={`equipment${index}_serial`}
                      name={`equipment${index}_serial`}
                      value={formData[`equipment${index}_serial`] || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditServiceRecordModal; 