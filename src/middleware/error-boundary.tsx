import { Component, type ReactNode,  } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error captured:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong 😢</div>;
    }
    return this.props.children;
  }
}
