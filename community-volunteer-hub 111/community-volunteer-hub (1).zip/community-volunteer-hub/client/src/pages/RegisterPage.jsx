import AuthForm from "../components/AuthForm";

function RegisterPage() {
  return (
    <main className="main-content auth-page">
      <AuthForm mode="register" />
    </main>
  );
}

export default RegisterPage;