import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console or error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            minHeight: "50vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h2 style={{ color: "#e74c3c", marginBottom: "1rem" }}>
            Oops! Có lỗi xảy ra
          </h2>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>
            Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.
          </p>

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "1rem",
            }}
          >
            Tải lại trang
          </button>

          <button
            onClick={() => window.history.back()}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#95a5a6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Quay lại
          </button>

          {/* Show error details in development */}
          {process.env.NODE_ENV === "development" && (
            <details
              style={{
                marginTop: "2rem",
                textAlign: "left",
                maxWidth: "600px",
                width: "100%",
              }}
            >
              <summary style={{ cursor: "pointer", marginBottom: "1rem" }}>
                Chi tiết lỗi (Development)
              </summary>
              <pre
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "1rem",
                  borderRadius: "4px",
                  fontSize: "12px",
                  overflow: "auto",
                }}
              >
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
