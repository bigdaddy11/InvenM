import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 이전 경로 저장
  const redirectPath = location.state?.from?.pathname || '/customers';

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(username, password, redirectPath);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2>Inven M</h2>
        <input
          type="text"
          value={username}
          name="username"
          placeholder="아이디"
          style={styles.input}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={password}
          style={styles.input}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" style={styles.button}>
          로그인
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
    padding: '20px',
    borderRadius: '5px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  input: {
    marginBottom: '15px',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '3px',
    border: '1px solid #ddd',
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '3px',
    border: 'none',
    backgroundColor: '#4CAF50',
    color: 'white',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    fontSize: '14px',
    marginBottom: '15px',
  },
};

export default LoginPage;
