import { useState, useEffect } from "react";

function AuthForm({ mode }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const link1 = document.createElement('link');
    link1.rel = 'stylesheet';
    link1.href = '/css/style.css';
    document.head.appendChild(link1);

    const link2 = document.createElement('link');
    link2.rel = 'stylesheet';
    link2.href = '/css/forms.css';
    document.head.appendChild(link2);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (mode === "register" && !formData.name.trim()) {
      return "Name is required";
    }
    if (!formData.email.includes("@")) {
      return "Valid email is required";
    }
    if (formData.password.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (mode === "register" && formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const url = mode === "register" ? "/api/register" : "/api/login";
      const body =
        mode === "register"
          ? { name: formData.name, email: formData.email, password: formData.password }
          : { email: formData.email, password: formData.password };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error);
      } else {
        setSuccess(
          mode === "register"
            ? "Account created successfully! Redirecting..."
            : "Login successful! Redirecting..."
        );
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <img src="/images/logo.png" alt="Community Help Hub" className="auth-logo" />
        <h1>{mode === "register" ? "Create Your Account" : "Welcome Back"}</h1>
        <p>
          {mode === "register"
            ? "Join the community and start helping or getting help"
            : "Sign in to your account"}
        </p>
      </div>

      {error && (
        <div style={{ color: "red", textAlign: "center", marginBottom: "15px", fontWeight: "bold" }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ color: "green", textAlign: "center", marginBottom: "15px", fontWeight: "bold" }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {mode === "register" && (
          <div className="form-group">
            <label>Full Name <span className="required-star">*</span></label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="e.g., John Doe"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
        )}

        <div className="form-group">
          <label>Email Address <span className="required-star">*</span></label>
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="e.g., john@example.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Password <span className="required-star">*</span></label>
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        {mode === "register" && (
          <div className="form-group">
            <label>Confirm Password <span className="required-star">*</span></label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
        )}

        <button type="submit" className="btn-primary btn-full" disabled={loading}>
          {loading ? "Please wait..." : mode === "register" ? "Create Account" : "Sign In"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "16px" }}>
        {mode === "register" ? (
          <>Already have an account? <a href="/login">Sign in here</a></>
        ) : (
          <>Don't have an account? <a href="/register">Sign up here</a></>
        )}
      </p>
    </div>
  );
}

export default AuthForm;