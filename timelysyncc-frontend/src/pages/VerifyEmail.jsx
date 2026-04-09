import React, { useContext, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import { MailCheck } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const initialEmail = useMemo(() => params.get("email") || "", [params]);
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { verifyEmail, resendVerification } = useContext(AuthContext);

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !code.trim()) {
      setError("Email and verification code are required.");
      return;
    }

    setLoading(true);
    const result = await verifyEmail(email.trim(), code.trim());
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setError("");

    if (!email.trim()) {
      setError("Enter your email before requesting another code.");
      return;
    }

    setResending(true);
    const result = await resendVerification(email.trim());
    if (!result.success) {
      setError(result.error);
    }
    setResending(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient-primary">
      <Container className="d-flex justify-content-center">
        <Card className="shadow-lg border-0" style={{ width: "100%", maxWidth: "500px" }}>
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <div className="bg-info text-white rounded-circle d-inline-flex p-3 mb-3">
                <MailCheck size={32} />
              </div>
              <h2 className="fw-bold">Verify Your Email</h2>
              <p className="text-muted mb-0">
                Enter the 6-digit code sent to your inbox to activate your account.
              </p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleVerify}>
              <Form.Group className="mb-3" controlId="verifyEmail">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="verifyCode">
                <Form.Label>Verification Code</Form.Label>
                <Form.Control
                  type="text"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="Enter the 6-digit code"
                  maxLength={6}
                  required
                />
              </Form.Group>

              <Button type="submit" variant="info" className="w-100 py-2 fw-semibold mb-3" disabled={loading}>
                {loading ? "Verifying..." : "Verify Email"}
              </Button>

              <Button
                type="button"
                variant="outline-secondary"
                className="w-100 py-2 fw-semibold"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? "Sending..." : "Resend Code"}
              </Button>
            </Form>

            <div className="text-center mt-4">
              <p className="text-muted small mb-0">
                Already verified?{" "}
                <Link to="/login" className="fw-bold text-decoration-none">
                  Go to sign in
                </Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
