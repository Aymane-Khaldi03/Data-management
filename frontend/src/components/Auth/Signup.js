import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import signupBackgroundImage from '../../assets/loginpageimage.jpg';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styled from 'styled-components';

const Signup = () => {
  const { signup } = useAuth();
  const history = useHistory();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isHovering, setIsHovering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      return;
    }
    try {
      await signup(fullName, email, password);
      setMessage('Signup successful! Redirecting to login...');
      setTimeout(() => {
        history.push('/login');
      }, 2000);
    } catch (error) {
      const errorMessage = error.response && error.response.data ? error.response.data.msg : error.message;
      setMessage('Signup failed: ' + errorMessage);
    }
  };

  return (
    <Container>
      <Background />
      <Title>Signup</Title>
      {message && <Message>{message}</Message>}
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Full Name</Label>
          <Input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </FormGroup>
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
          Signup
        </Button>
        <Footer>
          Already a member? <Link href="/login">Login Now</Link>
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
  background: url(${signupBackgroundImage}) no-repeat center center fixed;
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
  padding: 50px 50px;
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
  margin-bottom: 20px;
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
    margin-top: 1px;
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

const Link = styled.a`
  color: #ef6108;
  text-decoration: none;
  font-size: 14px;
`;

const Footer = styled.footer`
  margin-top: 10px;
  font-size: 14px;
  color: #777;
  font-weight: bold;
  position: absolute;
  bottom: 10px;
  width: calc(100% - 100px);
  text-align: center;
`;

const Message = styled.p`
  color: red;
  font-style: italic;
`;

export default Signup;
