import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Header from './pages/Header';
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
          <Header />
        {/* Routes */}
        <div style={styles.content}>
          <Routes>
            {/* <Route path="/" element={<Home />} /> */}
            <Route path="/" element={<Invoice />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/contact" element={<Contact />} />
            
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