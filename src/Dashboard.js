import React from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // 로그아웃 후 로그인 화면으로 이동
  };

  return (
    <div>
      <h1>대시보드</h1>
      <button onClick={handleLogout}>로그아웃</button>
    </div>
  );
};

export default Dashboard;
