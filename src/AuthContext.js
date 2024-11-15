import React, { createContext, useState, useContext } from 'react';

// Context 생성
const AuthContext = createContext();

// Context Provider
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 기본 로그인 상태

  // 로그인 함수
  const login = (token) => {
    localStorage.setItem('authToken', token); // 토큰 저장
    setIsLoggedIn(true);
  };

  // 로그아웃 함수 (navigate를 호출하지 않음)
  const logout = () => {
    localStorage.removeItem('authToken'); // 토큰 삭제
    setIsLoggedIn(false);
  };

  // 초기 세션 체크
  const checkSession = () => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token); // 토큰 유무로 로그인 상태 설정
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

// AuthContext를 사용하는 커스텀 훅
export const useAuth = () => {
  return useContext(AuthContext);
};
