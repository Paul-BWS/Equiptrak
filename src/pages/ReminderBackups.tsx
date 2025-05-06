import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listAvailableBackups, restoreFromBackup } from '../services/backupService';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Upload } from 'lucide-react';

export function ReminderBackups() {
  const [backupData, setBackupData] = useState({ dates: [], backups: {} });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setIsLoading(true);
    try {
      const data = await listAvailableBackups();
      setBackupData(data);
      if (data.dates.length > 0) {
        setSelectedDate(data.dates[0]);
        if (data.backups[data.dates[0]].length > 0) {
          setSelectedTime(data.backups[data.dates[0]][0]);
        }
      }
    } catch (error) {
      setMessage({
        text: `Error loading backups: ${error.message}`,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedDate || !selectedTime) {
      setMessage({
        text: 'Please select a backup date and time',
        type: 'error'
      });
      return;
    }

    setIsRestoring(true);
    setMessage({ text: '', type: '' });

    try {
      const result = await restoreFromBackup(selectedDate, selectedTime);
      setMessage({
        text: `Restored ${result.reminderCount} reminders and ${result.logCount} logs from ${result.date} ${result.time}`,
        type: 'success'
      });
    } catch (error) {
      setMessage({
        text: `Error restoring backup: ${error.message}`,
        type: 'error'
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="w-full bg-white shadow-sm mb-6">
        <div className="max-w-[95%] mx-auto py-3 flex justify-between items-center">
          <div>
            <Button 
              variant="outline"
              onClick={() => navigate('/admin')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="font-semibold text-lg">
            Reminder System Backups
          </div>
          
          <div className="w-[100px]">
            {/* Empty div for balanced layout */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[95%] mx-auto pb-6">
        <div className="bg-white rounded-lg shadow p-4">
          {message.text && (
            <div className={`mb-4 p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              {message.text}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">Loading available backups...</div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-4">Available Backups</h2>
                
                {backupData.dates.length === 0 ? (
                  <p>No backups found</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Backup Date
                      </label>
                      <select
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          if (backupData.backups[e.target.value].length > 0) {
                            setSelectedTime(backupData.backups[e.target.value][0]);
                          } else {
                            setSelectedTime('');
                          }
                        }}
                        className="border rounded p-2 w-full"
                      >
                        <option value="">Select Date</option>
                        {backupData.dates.map(date => (
                          <option key={date} value={date}>{date}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Backup Time
                      </label>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="border rounded p-2 w-full"
                        disabled={!selectedDate || backupData.backups[selectedDate]?.length === 0}
                      >
                        <option value="">Select Time</option>
                        {selectedDate && backupData.backups[selectedDate]?.map(time => {
                          // Format time as HH:MM:SS
                          const formattedTime = `${time.substring(0, 2)}:${time.substring(2, 4)}:${time.substring(4, 6)}`;
                          return (
                            <option key={time} value={time}>{formattedTime}</option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={handleRestore}
                  disabled={isRestoring || !selectedDate || !selectedTime}
                  className="bg-[#21c15b] hover:bg-[#1ca64d] text-white flex items-center"
                >
                  {isRestoring ? 'Restoring...' : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Restore Selected Backup
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReminderBackups; 