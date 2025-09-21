import { LoadingOverlay, Box } from '@mantine/core';


const LoadingComponent = (
    { visible = false,
        loaderProps = { size: 'xl', color: 'var(--app-primary-color)', type: 'bars' },
        zIndex = 999,
        children,
        // content to show behind the overlay 
    }) => {
    return (
        <Box pos="relative">
            <LoadingOverlay
                visible={visible}
                loaderProps={loaderProps}
                zIndex={zIndex}
            /> {children}
        </Box>);
}; export default LoadingComponent;