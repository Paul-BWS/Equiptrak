import React, { useState, useEffect } from 'react';
import EditServiceRecordModal from './EditServiceRecordModal';
import { format } from 'date-fns';

const ServiceRecordDetail = ({ companyId, recordId, onClose }) => {
  const [serviceRecord, setServiceRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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

  // Fetch the service record details
  useEffect(() => {
    const fetchServiceRecord = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/service-records/${recordId}`, {
          headers: getAuthHeaders(),
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch service record: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Loaded service record:", data);
        setServiceRecord(data);
      } catch (err) {
        console.error("Error fetching service record:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (recordId) {
      fetchServiceRecord();
    }
  }, [recordId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = (updatedRecord) => {
    setServiceRecord(updatedRecord);
    setIsEditing(false);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (err) {
      console.error('Error formatting date:', err);
      return dateString;
    }
  };

  if (loading) {
    return <div>Loading service record details...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (isEditing) {
    return (
      <EditServiceRecordModal 
        serviceRecordId={recordId} 
        onClose={() => setIsEditing(false)}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="service-record-detail">
      <h2>Service Record Details</h2>
      
      {serviceRecord ? (
        <div className="details-container">
          <div className="detail-row">
            <span className="label">Certificate Number:</span>
            <span className="value">{serviceRecord.certificate_number || 'N/A'}</span>
          </div>
          
          <div className="detail-row">
            <span className="label">Service Date:</span>
            <span className="value">{formatDate(serviceRecord.service_date)}</span>
          </div>
          
          <div className="detail-row">
            <span className="label">Retest Date:</span>
            <span className="value">{formatDate(serviceRecord.retest_date)}</span>
          </div>
          
          <div className="detail-row">
            <span className="label">Engineer:</span>
            <span className="value">{serviceRecord.engineer_name || 'N/A'}</span>
          </div>
          
          <h3>Equipment</h3>
          {[1, 2, 3, 4, 5, 6].map(index => {
            const nameField = `equipment${index}_name`;
            const serialField = `equipment${index}_serial`;
            
            if (!serviceRecord[nameField]) return null;
            
            return (
              <div key={index} className="equipment-item">
                <div className="detail-row">
                  <span className="label">Equipment {index}:</span>
                  <span className="value">{serviceRecord[nameField]}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Serial Number:</span>
                  <span className="value">{serviceRecord[serialField] || 'N/A'}</span>
                </div>
              </div>
            );
          })}
          
          {serviceRecord.notes && (
            <div className="detail-row">
              <span className="label">Notes:</span>
              <span className="value">{serviceRecord.notes}</span>
            </div>
          )}
          
          <div className="actions">
            <button
              className="btn-primary"
              onClick={handleEdit}
              style={{ backgroundColor: '#a6e15a', color: '#000' }}
            >
              Edit Service Record
            </button>
            <button
              className="btn-secondary"
              onClick={onClose}
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #ccc', marginLeft: '10px' }}
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <div>No service record found</div>
      )}
    </div>
  );
};

export default ServiceRecordDetail; 