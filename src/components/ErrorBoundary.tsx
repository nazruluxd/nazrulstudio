import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Nazrul Studio Runtime Uncaught Error caught by boundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('nazrul_studio_app_data_v2');
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B1121] text-slate-200 flex items-center justify-center p-6 selection:bg-purple-500 selection:text-white">
          <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-5 text-purple-400">
              <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Display Recovery</h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              The studio caught a display rendering anomaly. You can restore the portfolio layout instantly with fresh initial data.
            </p>
            {this.state.error?.message && (
              <div className="text-left bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 text-xs font-mono text-purple-300/80 mb-6 max-h-28 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-purple-600/25 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-arrows-rotate"></i>
                Reset & Reload Studio
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-medium text-xs transition-colors cursor-pointer"
              >
                Attempt In-Place Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
