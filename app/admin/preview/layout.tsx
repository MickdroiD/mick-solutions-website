export default function AdminPreviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Return a clean layout without sidebar or admin headers
    return (
        <div style={{
            width: '100%',
            minHeight: '100vh',
            backgroundColor: '#0a0a0f', // Match default dark theme
            color: 'white'
        }}>
            {children}
        </div>
    );
}
