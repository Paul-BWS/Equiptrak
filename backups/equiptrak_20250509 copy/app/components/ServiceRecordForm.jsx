const handleDateChange = (date) => {
  setFormData(prev => ({
    ...prev,
    service_date: date,
    // Calculate retest_date as 364 days after service_date
    retest_date: new Date(new Date(date).setDate(new Date(date).getDate() + 364))
  }));
}; 