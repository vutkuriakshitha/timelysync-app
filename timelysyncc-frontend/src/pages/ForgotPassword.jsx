import React, { useContext, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import { KeyRound } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const PASSWORD_RULE =
  "Password must be 8+ characters and include one uppercase letter, one number, and one special character.";

function isStrongPassword(value) {
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/.test(value);
}

export default function ForgotPassword() {
  const [params] = useSearchParams();
  const initialEmail = useMemo(() => params.get("email") || "", [params]);
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { forgotPassword, resetPassword } = useContext(AuthContext);

  const handleSendCode = async () => {
    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setSendingCode(true);
    const result = await forgotPassword(email.trim());
    if (!result.success) {
      setError(result.error);
    }
    setSendingCode(false);
  };

  const handleReset = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !code.trim() || !password || !confirmPassword) {
      setError("Email, reset code, and both password fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isStrongPassword(password)) {
      setError(PASSWORD_RULE);
      return;
    }

    setResetting(true);
    const result = await resetPassword(email.trim(), code.trim(), password);
    if (!result.success) {
      setError(result.error);
    }
    setResetting(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient-primary">
      <Container className="d-flex justify-content-center">
        <Card className="shadow-lg border-0" style={{ width: "100%", maxWidth: "520px" }}>
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <div className="bg-warning text-white rounded-circle d-inline-flex p-3 mb-3">
                <KeyRound size={32} />
              </div>
              <h2 className="fw-bold">Reset Password</h2>
              <p className="text-muted mb-0">
                Request a reset code, then set a new password for your account.
              </p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleReset}>
              <Form.Group className="mb-3" controlId="resetEmail">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </Form.Group>

              <Button
                type="button"
                variant="outline-primary"
                className="w-100 py-2 fw-semibold mb-3"
                onClick={handleSendCode}
                disabled={sendingCode}
              >
                {sendingCode ? "Sending code..." : "Send Reset Code"}
              </Button>

              <Form.Group className="mb-3" controlId="resetCode">
                <Form.Label>Reset Code</Form.Label>
                <Form.Control
                  type="text"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="Enter the 6-digit code"
                  maxLength={6}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-2" controlId="newPassword">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your new password"
                  required
                />
              </Form.Group>
              <div className="small text-muted mb-3">{PASSWORD_RULE}</div>

              <Form.Group className="mb-4" controlId="confirmNewPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm your new password"
                  required
                />
              </Form.Group>

              <Button type="submit" variant="warning" className="w-100 py-2 fw-semibold" disabled={resetting}>
                {resetting ? "Updating password..." : "Reset Password"}
              </Button>
            </Form>

            <div className="text-center mt-4">
              <p className="text-muted small mb-0">
                Remembered your password?{" "}
                <Link to="/login" className="fw-bold text-decoration-none">
                  Sign in
                </Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
