import React, { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, info: null };
    }

    static getDerivedStateFromError(error) {
        // Update state to render fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        // Log error information
        console.error("Error caught by ErrorBoundary:", error);
        this.setState({ error, info });
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div>
                    <h1>Something went wrong.</h1>
                    <p>{this.state.error?.message}</p>
                </div>
            );
        }

        return this.props.children; // Render the child components
    }
}

export default ErrorBoundary;
