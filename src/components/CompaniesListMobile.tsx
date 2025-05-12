import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  TextField, 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  AppBar, 
  Toolbar,
  InputAdornment,
  Paper
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';

interface Company {
  id: number;
  company_name: string;
  address: string;
  city?: string;
  county?: string;
  postcode?: string;
}

export default function CompaniesListMobile() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const navigate = useNavigate();
  const theme = useTheme();

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // Get the auth token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No auth token found');
          navigate('/login');
          return;
        }

        const response = await axios.get('/api/companies', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setCompanies(response.data);
        setFilteredCompanies(response.data);
      } catch (error) {
        console.error('Error fetching companies:', error);
        // If we get a 401, redirect to login
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.log('Session expired or invalid token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
    };
    fetchCompanies();
  }, [navigate]);

  // Handle search
  useEffect(() => {
    const filtered = companies.filter(company =>
      company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.address?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (company.postcode?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [searchTerm, companies]);

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Navigate to login
    navigate('/login');
  };

  const formatAddress = (company: Company) => {
    const parts = [
      company.address,
      company.city,
      company.county,
      company.postcode
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <Box sx={{ pb: 7, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: '#ffffff', boxShadow: 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton 
            edge="start" 
            onClick={handleLogout}
            sx={{ color: '#2196f3' }} // Button blue color
          >
            <LogoutIcon />
          </IconButton>
          <Typography variant="h6" sx={{ color: '#333333', fontWeight: 500 }}>
            Companies
          </Typography>
          <IconButton 
            edge="end" 
            onClick={() => navigate('/companies/add')}
            sx={{ color: '#2196f3' }} // Button blue color
          >
            <AddIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Search Bar */}
      <Box sx={{ p: 2, bgcolor: '#ffffff' }}>
        <Paper
          elevation={0}
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #e0e0e0',
            borderRadius: 2
          }}
        >
          <InputAdornment position="start" sx={{ pl: 1 }}>
            <SearchIcon sx={{ color: '#2196f3' }} /> {/* Button blue color */}
          </InputAdornment>
          <TextField
            fullWidth
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: { 
                px: 1,
                '& input': {
                  padding: '8px 0'
                }
              }
            }}
          />
        </Paper>
      </Box>

      {/* Companies List */}
      <Box sx={{ p: 2 }}>
        {filteredCompanies.map((company) => (
          <Card
            key={company.id}
            sx={{
              mb: 2,
              borderRadius: 2,
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 3
              }
            }}
            onClick={() => navigate(`/companies/${company.id}`)}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: '#333333',
                  mb: 0.5
                }}
              >
                {company.company_name}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#666666',
                  fontSize: '0.875rem'
                }}
              >
                {formatAddress(company)}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
} 