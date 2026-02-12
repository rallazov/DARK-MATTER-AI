import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto mt-20 max-w-xl rounded-2xl border border-rose-600/40 bg-rose-900/20 p-6 text-center">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-slate-300">Please refresh. Your vault data remains private and unchanged.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
