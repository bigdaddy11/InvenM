import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Products from './pages/Products';
import Excel from './pages/Excel';
import Invoice from './pages/Invoice';

const App = () => {
  return (
    <Router>
      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.appName}>Inven M</div>
          <nav style={styles.nav}>
            {/* <Link to="/" style={styles.link}>Home</Link>
            <Link to="/about" style={styles.link}>About</Link>
            <Link to="/products" style={styles.link}>Products</Link>
            <Link to="/contact" style={styles.link}>Contact</Link> */}
            <Link to="/Invoice" style={styles.link}>발주관리</Link>
          </nav>
        </header>

        {/* Routes */}
        <div style={styles.content}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/Invoice" element={<Invoice />} />
            <Route path="/excel" element={<Excel />} />
          </Routes>
        </div>
      </div>
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
    maxWidth: '800px',
    margin: '0 auto', // 화면 중앙 정렬
    padding: '0 20px', // 모바일에서 좌우 패딩
  },
  header: {
    width: '100%',
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 10px',
    backgroundColor: '#FFD73C',
    boxSizing: 'border-box',
  },
  appName: {
    color: 'black',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  nav: {
    display: 'flex',
    gap: '20px',
  },
  link: {
    color: 'black',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 'bold'
  },
  content: {
    width: '100%',
    //marginTop: '5px',
    backgroundColor: "whitesmoke",
    display: 'flex',
    flexDirection: "column",
    flexGrow: 1,
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
