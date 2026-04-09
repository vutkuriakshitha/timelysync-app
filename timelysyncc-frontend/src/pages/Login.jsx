import React, { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Card, Container, Form, Spinner } from "react-bootstrap";
import { Lock, LogIn, Mail } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const rememberedEmail = useMemo(
    () => localStorage.getItem("timelysync.rememberedEmail") || "",
    [],
  );
  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(Boolean(rememberedEmail));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email.trim(), password, remember);
    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient-primary">
      <Container className="d-flex justify-content-center">
        <Card className="shadow-lg border-0" style={{ width: "100%", maxWidth: "460px" }}>
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <div className="bg-primary text-white rounded-circle d-inline-flex p-3 mb-3">
                <LogIn size={32} />
              </div>
              <h2 className="fw-bold">Sign In</h2>
              <p className="text-muted mb-0">Access your TimelySync dashboard</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email Address</Form.Label>
                <div className="position-relative">
                  <Mail
                    size={18}
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                  />
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    className="ps-5 py-2"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label>Password</Form.Label>
                  <Link to={`/forgot-password?email=${encodeURIComponent(email)}`} className="small text-decoration-none">
                    Forgot password?
                  </Link>
                </div>
                <div className="position-relative">
                  <Lock
                    size={18}
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                  />
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    className="ps-5 py-2"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4" controlId="remember">
                <Form.Check
                  type="checkbox"
                  label="Remember my email"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                className="w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </Form>

            <div className="text-center mt-4">
              <p className="text-muted small mb-0">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="fw-bold text-decoration-none">
                  Create one now
                </Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
