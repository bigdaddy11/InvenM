import { Link, useNavigate } from 'react-router-dom';

const Header = () => {

  return (
    <header style={styles.header}>
      <Link style={styles.appName} to="/">
        Inven M
      </Link>
      <nav style={styles.nav}>
        <Link to="/" style={styles.link}>거래처관리</Link>
        <Link to="/products" style={styles.link}>상품관리</Link>
        <Link to="/invoice" style={styles.link}>송장관리</Link>
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