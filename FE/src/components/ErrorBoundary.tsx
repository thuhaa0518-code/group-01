import React, { Component, ReactNode } from 'react';
import { Button } from './ui/Button';

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

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch {}
    window.location.href = '/login';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-6 text-center">
          <div className="max-w-md rounded-xl border border-danger-200 bg-white p-6 shadow-lg">
            <h2 className="text-xl font-bold text-danger-700">Đã xảy ra lỗi giao diện</h2>
            <p className="mt-2 text-sm text-ink-600">
              {this.state.error?.message || 'Có lỗi bất ngờ khi tải dữ liệu. Vui lòng tải lại trang hoặc đặt lại dữ liệu phiên làm việc.'}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="primary" onClick={() => window.location.reload()}>
                Tải lại trang
              </Button>
              <Button variant="secondary" onClick={this.handleReset}>
                Reset dữ liệu & Đăng nhập
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
