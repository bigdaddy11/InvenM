import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './pages/common/api'; // axios 설정된 API 호출 모듈

const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // 초기화

    try {
      const response = await api.post('/api/auth/login', credentials);
      const { token } = response.data;

      // 토큰 저장
      localStorage.setItem('authToken', token);

      // 대시보드로 이동
      navigate('/');
    } catch (err) {
      setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2>Inven M</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input
          type="text"
          name="username"
          placeholder="아이디"
          value={credentials.username}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={credentials.password}
          onChange={handleChange}
          style={styles.input}
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
