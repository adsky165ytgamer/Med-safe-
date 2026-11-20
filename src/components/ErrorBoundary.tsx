import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught render error in MedSafe AI:", error, errorInfo);
  }

  handleReload = () => {
    localStorage.removeItem("medsafe_cabinet_v1");
    localStorage.removeItem("medsafe_pill_tasks_v1");
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#061412] text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl font-bold">
              💊
            </div>
            <h2 className="text-xl font-black text-white">MedSafe AI - Recovery Mode</h2>
            <p className="text-xs text-slate-400">
              An unexpected display issue occurred. Tap below to reload fresh clinical data.
            </p>
            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-slate-950 text-left text-xs text-red-300 font-mono overflow-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all"
              >
                Reload App
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
              >
                Reset Stored Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
