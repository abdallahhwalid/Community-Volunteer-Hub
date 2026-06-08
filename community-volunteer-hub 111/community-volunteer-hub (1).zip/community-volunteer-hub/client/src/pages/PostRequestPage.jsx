import { useEffect } from "react";
import RequestForm from "./RequestForm"; // Adjust import paths as needed

export default function PostRequestPage() {
  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => { if (!d.success) window.location.href = "/login"; })
      .catch(() => { window.location.href = "/login"; });
  }, []);

  return (
    <main className="main-content">
      <div className="form-page">
        <div className="form-page-header">
          <h1>Post a Help Request</h1>
          <p>Describe what you need help with and our volunteers will reach out</p>
        </div>
        
        <RequestForm />
      </div>
    </main>
  );
}