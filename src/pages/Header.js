import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../AuthContext'; // AuthContext import

const Header = () => {
  const { logout } = useAuth(); // logout 메서드 가져오기
  const navigate = useNavigate();

  const handleLogout = () => {
    // 세션 또는 토큰 삭제 로직
    logout(); // AuthContext에서 로그아웃 상태 업데이트
    alert('로그아웃되었습니다.');
  };

  return (
    <header style={styles.header}>
      <Link style={styles.appName} to="/">
        Inven M
      </Link>
      <nav style={styles.nav}>
        <Link to="/customers" style={styles.link}>거래처관리</Link>
        <Link to="/products" style={styles.link}>상품관리</Link>
        <Link to="/invoice/management" style={styles.link}>송장관리</Link>
        <div style={styles.iconContainer} onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} style={styles.icon} />
        </div>
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