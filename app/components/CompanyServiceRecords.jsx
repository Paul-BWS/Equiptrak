import React, { useState, useEffect } from 'react';
import ServiceRecordDetail from './ServiceRecordDetail';
import { format } from 'date-fns';

const CompanyServiceRecords = ({ companyId }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  
  useEffect(() => {
    const fetchServiceRecords = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/service-records?company_id=${companyId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch service records: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Loaded service records:", data);
        setRecords(data);
      } catch (err) {
        console.error("Error fetching service records:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (companyId) {
      fetchServiceRecords();
    }
  }, [companyId]);
  
  // Calculate status based on retest date
  const calculateStatus = (retestDate) => {
    if (!retestDate) return 'invalid';
    
    const today = new Date();
    const retest = new Date(retestDate);
    
    if (retest < today) {
      return 'expired';
    } else if (retest.getTime() - today.getTime() < 30 * 24 * 60 * 60 * 1000) {
      return 'due-soon';
    } else {
      return 'valid';
    }
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
  
  const handleViewRecord = (recordId) => {
    setSelectedRecordId(recordId);
  };
  
  const handleCloseDetail = () => {
    setSelectedRecordId(null);
    // Refresh the records list
    if (companyId) {
      setLoading(true);
      fetch(`/api/service-records?company_id=${companyId}`)
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch updated records');
          return response.json();
        })
        .then(data => {
          setRecords(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error refreshing records:", err);
          setLoading(false);
        });
    }
  };
  
  if (selectedRecordId) {
    return (
      <ServiceRecordDetail 
        companyId={companyId}
        recordId={selectedRecordId}
        onClose={handleCloseDetail}
      />
    );
  }
  
  if (loading) {
    return <div>Loading service records...</div>;
  }
  
  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }
  
  if (records.length === 0) {
    return <div>No service records found for this company.</div>;
  }
  
  return (
    <div className="service-records-container">
      <h2>Service Records</h2>
      
      <table className="records-table">
        <thead>
          <tr>
            <th>Certificate #</th>
            <th>Service Date</th>
            <th>Retest Date</th>
            <th>Engineer</th>
            <th>Status</th>
            <th>Equipment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map(record => {
            const status = calculateStatus(record.retest_date);
            
            // Find the first equipment item
            let equipment = 'N/A';
            for (let i = 1; i <= 6; i++) {
              const nameField = `equipment${i}_name`;
              if (record[nameField]) {
                equipment = record[nameField];
                break;
              }
            }
            
            return (
              <tr key={record.id} className={`status-${status}`}>
                <td>{record.certificate_number || 'N/A'}</td>
                <td>{formatDate(record.service_date)}</td>
                <td>{formatDate(record.retest_date)}</td>
                <td>{record.engineer_name || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${status}`}>
                    {status === 'valid' ? 'Valid' : status === 'due-soon' ? 'Due Soon' : 'Expired'}
                  </span>
                </td>
                <td>{equipment}</td>
                <td>
                  <button 
                    onClick={() => handleViewRecord(record.id)}
                    className="view-button"
                    style={{ backgroundColor: '#a6e15a', color: '#000', border: 'none', padding: '5px 10px', borderRadius: '4px' }}
                  >
                    View & Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <style jsx>{`
        .service-records-container {
          padding: 20px;
        }
        
        .records-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        
        .records-table th, .records-table td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        .records-table th {
          background-color: #f5f5f5;
        }
        
        .status-badge {
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        
        .status-badge.valid {
          background-color: #a6e15a;
          color: #000;
        }
        
        .status-badge.due-soon {
          background-color: #ffc107;
          color: #000;
        }
        
        .status-badge.expired {
          background-color: #dc3545;
          color: #fff;
        }
      `}</style>
    </div>
  );
};

export default CompanyServiceRecords; 