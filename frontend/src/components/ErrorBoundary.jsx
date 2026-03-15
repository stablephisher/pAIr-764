import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[pAIr ErrorBoundary]', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: 'var(--red-light, #fef2f2)', color: 'var(--red, #ef4444)' }}>
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                        {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
                    </p>
                    <button onClick={this.handleRetry} className="btn btn-primary gap-2">
                        <RefreshCw size={16} /> Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
