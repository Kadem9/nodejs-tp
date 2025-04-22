import React from 'react';
import { Container, Box } from '@mui/material';

const Layout = ({ children }) => {
    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                {children}
            </Box>
        </Container>
    );
};

export default Layout;
