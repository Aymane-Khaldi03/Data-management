import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import loginpageimage from '../../assets/loginpageimage.jpg';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styled from 'styled-components';

const Login = () => {
  const { login } = useAuth();
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isHovering, setIsHovering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      setMessage('Login successful! Redirecting to dashboard...');

      // Redirect based on role
      setTimeout(() => {
        switch (user.role) {
          case 'admin':
            history.push('/dashboard');
            break;
          case 'consultant':
            history.push('/dashboard');
            break;
          default:
            history.push('/dashboard');
            break;
        }
      }, 2000);
    } catch (error) {
      setMessage('Login failed: ' + error.message);
    }
  };

  return (
    <Container>
      <Background />
      <Title>Login</Title>
      {message && <Message>{message}</Message>}
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </FormGroup>
        <FormGroup>
          <Label>Password</Label>
          <PasswordInput>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <EyeIcon onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </EyeIcon>
          </PasswordInput>
        </FormGroup>
        <Button
          type="submit"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          isHovering={isHovering}
        >
          Login
        </Button>
        <AdditionalOptions>
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <Link href="/forgot-password">Forgot password?</Link>
        </AdditionalOptions>
        <Footer>
          Not a member? <Link href="/signup">Signup Now</Link>
        </Footer>
      </Form>
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  overflow: hidden;
  margin: -10px;
  flex: 1;
`;

const Background = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url(${loginpageimage}) no-repeat center center fixed;
  background-size: cover;
  filter: blur(4px);
  z-index: -1;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 20px;
  font-weight: bold;
  font-size: 50px;
`;

const Form = styled.form`
  background: rgba(255, 255, 255, 0.9);
  padding: 70px 50px;
  border-radius: 10px;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
  text-align: left;
  width: 100%;
  max-width: 450px;
  z-index: 1;
  position: relative;
`;

const FormGroup = styled.div`
  margin-bottom: 30px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  box-sizing: border-box;
`;

const PasswordInput = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const EyeIcon = styled.div`
  position: absolute;
  right: 10px;
  cursor: pointer;
  margin-top: 13px;
  font-size: 16px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 5px;
  background-color: ${props => (props.isHovering ? 'black' : '#ef6108')};
  color: white;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
`;

const AdditionalOptions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
`;

const Link = styled.a`
  color: #ef6108;
  text-decoration: none;
  font-size: 14px;
`;

const Footer = styled.footer`
  margin-top: 20px;
  font-size: 14px;
  color: #777;
  font-weight: bold;
  position: absolute;
  bottom: 20px;
  width: 100%;
  text-align: center;
  align-items: center;
`;

const Message = styled.p`
  color: red;
  font-style: italic;
`;

export default Login;
