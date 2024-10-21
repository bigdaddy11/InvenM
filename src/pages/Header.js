import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    console.log("test");
    navigate('/about'); // 클릭 시 루트 경로로 이동
  };

  return (
    <header style={styles.header}>
      <Link style={styles.appName} to="/">
        Inven M
      </Link>
      <nav style={styles.nav}>
        <Link to="/" style={styles.link}>발주관리</Link>
        {/* <Link to="/about" style={styles.link}>About</Link>
        <Link to="/products" style={styles.link}>Products</Link>
        <Link to="/contact" style={styles.link}>Contact</Link> */}
      </nav>
    </header>
  );
};

const styles = {
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
        fontWeight: 'bold',
        cursor: 'pointer',
        textDecoration: 'none'
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
  };

  export default Header;