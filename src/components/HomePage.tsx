import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  AppBar,
  Toolbar,
  InputBase,
  Card,
  CardContent,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import InventoryIcon from '@mui/icons-material/Inventory';
import WorkIcon from '@mui/icons-material/Work';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ContactsIcon from '@mui/icons-material/Contacts';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import NoteAddIcon from '@mui/icons-material/NoteAdd';

export default function HomePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { title: 'Customers', icon: <BusinessIcon />, route: '/mobile/companies', color: '#4CAF50' },
    { title: 'Order No', icon: <InventoryIcon />, route: '/orders', color: '#FF9800' },
    { title: 'Products', icon: <InventoryIcon />, route: '/products', color: '#F44336' },
    { title: 'Work Week', icon: <WorkIcon />, route: '/work-week', color: '#3F51B5' },
    { title: 'Time Off', icon: <EventNoteIcon />, route: '/time-off', color: '#009688' },
    { title: 'CRM', icon: <ContactsIcon />, route: '/crm', color: '#795548' }
  ];

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: '#ffffff', boxShadow: 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
            BWS Mobile
          </Typography>
          <IconButton onClick={handleLogout} sx={{ color: '#2196f3' }}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Search Bar */}
      <Box sx={{ p: 2, bgcolor: '#ffffff' }}>
        <Paper
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 2,
            bgcolor: '#f8f9fa'
          }}
        >
          <SearchIcon sx={{ p: 1, color: '#9e9e9e' }} />
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search..."
            inputProps={{ 'aria-label': 'search' }}
          />
        </Paper>
      </Box>

      {/* Notes Preview Card */}
      <Box sx={{ p: 2 }}>
        <Card sx={{ 
          bgcolor: '#ffffff',
          borderRadius: 3,
          mb: 3,
          background: 'linear-gradient(45deg, #2196f3 30%, #21CBF3 90%)',
          color: 'white'
        }}>
          <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              <Typography variant="body2">
                Quick access to your recent notes
              </Typography>
            </Box>
            <IconButton 
              sx={{ 
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)'
                }
              }}
              onClick={() => navigate('/notes')}
            >
              <NoteAddIcon />
            </IconButton>
          </CardContent>
        </Card>
      </Box>

      {/* Menu Items */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2,
          '& > *': { 
            flexBasis: 'calc(50% - 8px)',
            flexGrow: 0,
            flexShrink: 0
          }
        }}>
          {menuItems.map((item, index) => (
            <Card 
              key={index}
              onClick={() => navigate(item.route)}
              sx={{
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 1
                }}>
                  <Box 
                    sx={{ 
                      p: 1, 
                      borderRadius: 2, 
                      bgcolor: `${item.color}15`,
                      color: item.color,
                      display: 'flex'
                    }}
                  >
                    {item.icon}
                  </Box>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {item.title}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
} 