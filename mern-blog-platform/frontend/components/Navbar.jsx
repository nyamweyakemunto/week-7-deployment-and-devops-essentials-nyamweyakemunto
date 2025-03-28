// client/src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search,
  Add,
  Notifications,
  AccountCircle,
  Logout,
  Settings,
  Dashboard
} from '@mui/icons-material';
import * as Sentry from '@sentry/react';
import { useAuth } from '../contexts/AuthContext';
import SearchBar from './SearchBar';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications (example)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (currentUser) {
          const response = await  axios .get(
            `${process.env.REACT_APP_API_URL}/api/users/notifications`,
            { withCredentials: true }
          );
          setNotifications(response.data);
        }
      } catch (err) {
        Sentry.captureException(err);
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
  }, [currentUser]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      Sentry.captureException(err);
      console.error('Failed to log out', err);
    }
    handleMenuClose();
  };

  const handleMobileToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <AppBar position="sticky" elevation={1} color="default">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left side - Logo/Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            BlogPlatform
          </Typography>
        </Box>

        {/* Center - Search (desktop only) */}
        {!isMobile && (
          <Box sx={{ flexGrow: 1, maxWidth: '600px', mx: 3 }}>
            <SearchBar />
          </Box>
        )}

        {/* Right side - Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isMobile && (
            <IconButton color="inherit" aria-label="search">
              <Search />
            </IconButton>
          )}

          {currentUser ? (
            <>
              <IconButton
                color="inherit"
                aria-label="create post"
                onClick={() => navigate('/create')}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                <Add />
              </IconButton>

              <IconButton color="inherit" aria-label="notifications">
                <Badge badgeContent={notifications.length} color="error">
                  <Notifications />
                </Badge>
              </IconButton>

              <IconButton
                color="inherit"
                aria-label="account"
                onClick={handleMenuOpen}
                sx={{ p: 0 }}
              >
                {currentUser.avatar ? (
                  <Avatar
                    alt={currentUser.name}
                    src={currentUser.avatar}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircle fontSize="large" />
                )}
              </IconButton>

              {/* User Menu Dropdown */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1
                    },
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0
                    }
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => navigate('/profile')}>
                  <Avatar /> Profile
                </MenuItem>
                <MenuItem onClick={() => navigate('/dashboard')}>
                  <ListItemIcon>
                    <Dashboard fontSize="small" />
                  </ListItemIcon>
                  Dashboard
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => navigate('/settings')}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/register')}
                sx={{ ml: 1 }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>

      {/* Mobile Search (when toggled) */}
      {isMobile && mobileOpen && (
        <Box sx={{ p: 2 }}>
          <SearchBar fullWidth />
        </Box>
      )}
    </AppBar>
  );
};

export default Sentry.withProfiler(Navbar);