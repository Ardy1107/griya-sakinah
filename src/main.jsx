import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Error Boundary component to catch and display errors
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px',
                    fontFamily: 'monospace',
                    background: '#1a1a2e',
                    color: '#f1f1f1',
                    minHeight: '100vh'
                }}>
                    <h1 style={{ color: '#ef4444' }}>⚠️ Application Error</h1>
                    <p style={{ color: '#fbbf24' }}>Something went wrong. Check console for details.</p>
                    <pre style={{
                        background: '#0f172a',
                        padding: '20px',
                        borderRadius: '8px',
                        overflow: 'auto',
                        fontSize: '12px',
                        lineHeight: '1.5'
                    }}>
                        <strong>Error:</strong> {this.state.error?.toString()}
                        {'\n\n'}
                        <strong>Stack:</strong> {this.state.error?.stack}
                        {'\n\n'}
                        <strong>Component Stack:</strong> {this.state.errorInfo?.componentStack}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '20px',
                            padding: '12px 24px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>,
)

