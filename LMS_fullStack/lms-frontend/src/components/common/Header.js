// src/components/common/Header.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  useMediaQuery,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  School as SchoolIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Add as AddIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout, isAuthenticated, isInstructor, isAdmin } = useAuth();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigationItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'Courses', path: '/courses', icon: <SchoolIcon /> },
    ...(isAuthenticated ? [
      { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    ] : []),
    ...(isInstructor ? [
      { text: 'Create Course', path: '/courses/create', icon: <AddIcon /> },
    ] : []),
  ];

  const drawer = (
    <Box sx={{ width: 250, height: '100%', bgcolor: '#fafafa' }}>
      <Box 
        sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          LMS Platform
        </Typography>
      </Box>
      <List sx={{ px: 2, py: 1 }}>
        {navigationItems.map((item) => (
          <ListItem
            key={item.text}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            sx={{ 
              cursor: 'pointer',
              borderRadius: 2,
              mb: 0.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'primary.50',
                transform: 'translateX(4px)',
              },
            }}
          >
            {item.icon && (
              <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
            )}
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: 500,
              }}
            />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      {isAuthenticated ? (
        <List sx={{ px: 2 }}>
          <ListItem
            onClick={() => {
              navigate('/profile');
              setMobileOpen(false);
            }}
            sx={{ 
              cursor: 'pointer',
              borderRadius: 2,
              mb: 0.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'primary.50',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Profile" 
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: 500,
              }}
            />
          </ListItem>
          <ListItem 
            onClick={handleLogout} 
            sx={{ 
              cursor: 'pointer',
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'error.50',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: 500,
                color: 'error.main',
              }}
            />
          </ListItem>
        </List>
      ) : (
        <List sx={{ px: 2 }}>
          <ListItem
            onClick={() => {
              navigate('/login');
              setMobileOpen(false);
            }}
            sx={{ 
              cursor: 'pointer',
              borderRadius: 2,
              mb: 0.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'primary.50',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemText 
              primary="Login" 
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: 500,
              }}
            />
          </ListItem>
          <ListItem
            onClick={() => {
              navigate('/register');
              setMobileOpen(false);
            }}
            sx={{ 
              cursor: 'pointer',
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'primary.50',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemText 
              primary="Register" 
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: 500,
              }}
            />
          </ListItem>
        </List>
      )}
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderBottomColor: 'grey.200',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 0 }, minHeight: { xs: 56, sm: 64 } }}>
            {isMobile && (
              <IconButton
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ 
                  mr: 1.5,
                  color: 'primary.main',
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                flexGrow: 1,
                textDecoration: 'none',
                color: 'primary.main',
                fontWeight: 700,
                fontSize: '1.25rem',
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              LMS Platform
            </Typography>

            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 0.5, mr: 2 }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.text}
                    component={Link}
                    to={item.path}
                    startIcon={item.icon}
                    sx={{
                      color: 'text.primary',
                      fontWeight: 500,
                      textTransform: 'none',
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 1.5,
                      fontSize: '0.925rem',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'primary.50',
                        color: 'primary.main',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}

            {isAuthenticated ? (
              <Box>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  sx={{
                    p: 0.25,
                    border: '2px solid',
                    borderColor: 'primary.100',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <Avatar
                    alt={user?.name}
                    src={user?.avatar}
                    sx={{ 
                      width: 32, 
                      height: 32,
                      bgcolor: 'primary.main',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  sx={{
                    mt: 0.5,
                    '& .MuiPaper-root': {
                      borderRadius: 1.5,
                      minWidth: 180,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      border: '1px solid',
                      borderColor: 'grey.200',
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {user?.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem 
                    onClick={() => { navigate('/profile'); handleClose(); }}
                    sx={{
                      py: 1,
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'primary.50',
                        pl: 2.5,
                      },
                    }}
                  >
                    <PersonIcon sx={{ mr: 1.5, fontSize: 18, color: 'primary.main' }} /> 
                    Profile
                  </MenuItem>
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{
                      py: 1,
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'error.50',
                        pl: 2.5,
                      },
                    }}
                  >
                    <LogoutIcon sx={{ mr: 1.5, fontSize: 18, color: 'error.main' }} /> 
                    <Typography color="error" fontSize="0.875rem">Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              !isMobile && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    component={Link} 
                    to="/login"
                    sx={{
                      color: 'text.primary',
                      fontWeight: 500,
                      textTransform: 'none',
                      px: 2,
                      py: 0.75,
                      borderRadius: 1.5,
                      fontSize: '0.925rem',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    sx={{
                      fontWeight: 600,
                      textTransform: 'none',
                      px: 2.5,
                      py: 0.75,
                      borderRadius: 1.5,
                      fontSize: '0.925rem',
                      background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.25)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: '0 4px 16px rgba(25, 118, 210, 0.35)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    Register
                  </Button>
                </Box>
              )
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 250,
            borderRight: 'none',
            boxShadow: '4px 0 20px rgba(0,0,0,0.08)',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;