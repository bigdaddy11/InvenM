import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './pages/common/api';

// Context 생성
const AuthContext = createContext();

// Context Provider
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 기본 로그인 상태
  const navigate = useNavigate();

  const login = async (username, password, redirectPath) => {
    try {
      // 서버로 로그인 요청
      const response = await api.post('/api/auth/login', { username, password });
      const { token } = response.data;

      // 세션 저장
      sessionStorage.setItem('authToken', token);
      setIsLoggedIn(true);

      // 이전 경로로 이동하거나 기본 경로로 이동
      navigate(redirectPath || '/customers');
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
    }
  };
  // 로그인 함수
  // const login = (token) => {
  //   localStorage.setItem('authToken', token); // 토큰 저장
  //   setIsLoggedIn(true);
    
  // };

  // 로그아웃 함수 (navigate를 호출하지 않음)
  const logout = () => {
    localStorage.removeItem('authToken'); // 토큰 삭제
    setIsLoggedIn(false);
    navigate('/');
  };

  // 초기 세션 체크
  const checkSession = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

// AuthContext를 사용하는 커스텀 훅
export const useAuth = () => useContext(AuthContext);