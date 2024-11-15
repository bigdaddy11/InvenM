import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // 여기에 서버 인증 로직 추가 (예: API 호출)
    const fakeToken = '12345'; // 예제용 토큰
    if (username === 'user' && password === 'password') {
      login(fakeToken); // 로그인 성공 시 토큰 저장
      navigate('/'); // 대시보드로 이동
    } else {
      alert('로그인 실패! 아이디와 비밀번호를 확인하세요.');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>로그인</h2>
      <input
        type="text"
        placeholder="아이디"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">로그인</button>
    </form>
  );
};

export default LoginPage;
