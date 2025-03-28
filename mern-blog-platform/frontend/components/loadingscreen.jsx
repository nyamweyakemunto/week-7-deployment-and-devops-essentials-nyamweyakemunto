import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingScreen = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="80vh"
    >
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" mt={2}>
        Loading...
      </Typography>
    </Box>
  );
};

export default LoadingScreen;