import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import { Lock, Mail, User, UserPlus } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const PASSWORD_RULE =
  "Password must be 8+ characters and include one uppercase letter, one number, and one special character.";

function isStrongPassword(value) {
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/.test(value);
}

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("All fields are required.");
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

    setLoading(true);
    const result = await register(name.trim(), email.trim(), password);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient-primary">
      <Container className="d-flex justify-content-center">
        <Card className="shadow-lg border-0" style={{ width: "100%", maxWidth: "520px" }}>
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <div className="bg-success text-white rounded-circle d-inline-flex p-3 mb-3">
                <UserPlus size={32} />
              </div>
              <h2 className="fw-bold">Create Account</h2>
              <p className="text-muted mb-0">Join TimelySync and verify your email to get started</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Full Name</Form.Label>
                <div className="position-relative">
                  <User
                    size={18}
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                  />
                  <Form.Control
                    type="text"
                    placeholder="Enter your full name"
                    className="ps-5 py-2"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>
              </Form.Group>

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

              <Form.Group className="mb-2" controlId="password">
                <Form.Label>Password</Form.Label>
                <div className="position-relative">
                  <Lock
                    size={18}
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                  />
                  <Form.Control
                    type="password"
                    placeholder="Create a password"
                    className="ps-5 py-2"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </Form.Group>
              <div className="small text-muted mb-3">{PASSWORD_RULE}</div>

              <Form.Group className="mb-4" controlId="confirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <div className="position-relative">
                  <Lock
                    size={18}
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                  />
                  <Form.Control
                    type="password"
                    placeholder="Confirm your password"
                    className="ps-5 py-2"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </Form.Group>

              <Button type="submit" variant="success" className="w-100 py-2 fw-semibold" disabled={loading}>
                {loading ? "Creating account..." : "Sign Up"}
              </Button>
            </Form>

            <div className="text-center mt-4">
              <p className="text-muted small mb-0">
                Already have an account?{" "}
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
