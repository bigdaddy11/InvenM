import { BrowserRouter as Router, Route, Routes, useLocation, Navigate  } from 'react-router-dom';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './LoginPage';
import CustomerManagement from './pages/customers/CustomerManagement';
import NewCustomerRegistration from './pages/customers/NewCustomerRegistration';
import CustomerProduct from './pages/products/CustomerProduct';
import NewProductRegistration from './pages/products/NewProductRegistration';
import ProductManagement from './pages/products/ProductsManagement';
import Invoice from './pages/invoice/Invoice';
import InvoiceManagement from './pages/invoice/InvoiceManagement';
import InvoiceManagementRegistration from './pages/invoice/InvoiceManagementRegistration';
import Header from './pages/Header';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppContent = () => {
  const location = useLocation(); // 현재 경로 가져오기
  const { isLoggedIn } = useAuth(); // 세션 상태 가져오기

  return (
    <div style={styles.container}>
      {/* 로그인 화면이 아니고, 세션이 유효할 경우에만 헤더 표시 */}
      {location.pathname !== '/' && isLoggedIn && <Header />}
      
      {/* Routes */}
      <div style={styles.content}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/customers" element={<PrivateRoute><CustomerManagement /></PrivateRoute>} />
          <Route path="/customers/new" element={<PrivateRoute><NewCustomerRegistration /></PrivateRoute>} />
          <Route path="/products" element={<PrivateRoute><CustomerProduct /></PrivateRoute>} />
          <Route path="/products/management" element={<PrivateRoute><ProductManagement /></PrivateRoute>} />
          <Route path="/products/management/new" element={<PrivateRoute><NewProductRegistration /></PrivateRoute>} />
          <Route path="/invoice" element={<PrivateRoute><Invoice /></PrivateRoute>} />
          <Route path="/invoice/management" element={<PrivateRoute><InvoiceManagement /></PrivateRoute>} />
          <Route path="/invoice/management/new" element={<PrivateRoute><InvoiceManagementRegistration /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

// 스타일 객체
const styles = {
  container: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '1800px',
    margin: '0 auto', // 화면 중앙 정렬
    padding: '0 20px', // 모바일에서 좌우 패딩
  },
  content: {
    width: '100%',
    backgroundColor: 'whitesmoke',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    height: '100%',
  },

  // 반응형 레이아웃
  '@media (max-width: 768px)': {
    nav: {
      flexDirection: 'column', // 모바일에서는 네비게이션이 세로로 정렬됨
      gap: '10px',
    },
  },
};

export default App;
