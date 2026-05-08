import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-950 border border-red-500/50 rounded-2xl m-4">
          <h2 className="text-xl font-bold text-red-400 mb-2">Ops! Algo deu errado.</h2>
          <p className="text-sm text-red-200/70 font-mono overflow-auto max-h-40">
            {this.state.error?.message}
          </p>
          <button 
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold"
            onClick={() => window.location.reload()}
          >
            Recarregar Aplicativo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
