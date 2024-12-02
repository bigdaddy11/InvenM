import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './pages/common/api';

// Context 생성
const AuthContext = createContext();

// Context Provider
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 기본 로그인 상태
  const [userId, setUserId] = useState(null); // 사용자 ID 상태 추가
  const navigate = useNavigate();

  const login = async (username, password, redirectPath) => {
    try {
      // 서버로 로그인 요청
      const response = await api.post('/api/auth/login', { username, password });
      const { token, id } = response.data;

      // 세션 저장
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('userId', id); // 사용자 ID 저장
      setIsLoggedIn(true);
      setUserId(id);

      // 이전 경로로 이동하거나 기본 경로로 이동
      navigate(redirectPath || '/customers');
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
    }
  };

  // 로그아웃 함수 (navigate를 호출하지 않음)
  const logout = () => {
    sessionStorage.removeItem('authToken'); // 토큰 삭제
    sessionStorage.removeItem('userId'); // 사용자 ID 삭제
    setIsLoggedIn(false);
    setUserId(null);
    navigate('/');
  };

  // 초기 세션 체크
  const checkSession = () => {
    const token = sessionStorage.getItem('authToken');
    const id = sessionStorage.getItem('userId'); // 세션에서 사용자 ID 가져오기
    if (token) {
      setIsLoggedIn(true);
      setUserId(id); // 세션에 ID가 있다면 상태에 저장
    } else {
      setIsLoggedIn(false);
      setUserId(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userId, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

// AuthContext를 사용하는 커스텀 훅
export const useAuth = () => useContext(AuthContext);