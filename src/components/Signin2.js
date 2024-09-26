import React, { useState, useContext } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import bg1 from "../assets/img/bg1.jpg";
import Link from "next/link";
import { UserContext } from "@/context/UserContext";
import { useRouter } from "next/router";

export default function Signin2() {
  const [email, setEmail] = useState("consultant");
  const [password, setPassword] = useState("Reset@1212");
  const { login } = useContext(UserContext);
  const router = useRouter();

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/user/login/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: email, password }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Store token and user profile in localStorage
        localStorage.setItem("authToken", data.token.access_token);
        localStorage.setItem("userProfile", JSON.stringify(data.profile));
        login(data.profile); // Call login to update UserContext

        // Redirect to home page
        router.push("/");
      } else {
        // Handle login failure
        alert("Login failed. Please check your email and password.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      alert("An error occurred while trying to log in.");
    }
  };

  return (
    <div className="page-sign d-block py-0">
      <Row className="g-0">
        <Col md="7" lg="5" xl="4" className="col-wrapper">
          <Card className="card-sign">
            <Card.Header>
              <Link href="/" className="header-logo mb-5">
                profit lever
              </Link>
              <Card.Title>Sign In</Card.Title>
              <Card.Text>Welcome back! Please sign in to continue.</Card.Text>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleLogin}>
                <div className="mb-4">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <Form.Label className="d-flex justify-content-between">
                    Password <Link href="">Forgot password?</Link>
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="btn-sign">
                  Sign In
                </Button>
              </Form>
            </Card.Body>
            <Card.Footer>
              Don&apos;t have an account?
              <Link href="/signup">Create an Account</Link>
            </Card.Footer>
          </Card>
        </Col>
        <Col className="d-none d-lg-block">
          <img src={bg1} className="auth-img" alt="" />
        </Col>
      </Row>
    </div>
  );
}
