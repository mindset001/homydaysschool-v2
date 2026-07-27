import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unhandled UI error:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
          <div className="font-bold text-[30px] sm:text-[39px] md:text-[50px]">
            Something went wrong
          </div>
          <div className="text-lg md:text-xl mt-2 text-gray-600 max-w-md">
            An unexpected error occurred. Please reload the page — if this keeps happening,
            contact the school.
          </div>
          <button
            onClick={this.handleReload}
            className="text-lg md:text-xl border py-2 px-4 border-solid rounded-lg text-nowrap border-[#F97316] text-white bg-[#F97316] mt-8"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
