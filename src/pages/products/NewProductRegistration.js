// NewCustomerRegistration.js

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import api from '../common/api'
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

function NewProductRegistration() {
  const { userId } = useAuth(); // AuthContext에서 userId 가져오기

  const location = useLocation();
  const [rowData, setRowData] = useState([]);

  const customerId = location.state?.customerId; // 전달받은 customerId
  const customerNm = location.state?.customerNm; // 전달받은 customerId
  const navigate = useNavigate();

  // 새로운 행 추가
  const handleAddRow = () => {
    const newRow = { id: '', productName: '', invoiceName: '', modelName: ''};
    setRowData([...rowData, newRow]);
  };

   // 서버에 데이터 전송
   const handleSubmit = async () => {
    if (rowData.length === 0) {
      alert('등록할 상품이 없습니다. 데이터를 입력해 주세요.');
      return;
    }

    // 빈 행 확인
    for (let i = 0; i < rowData.length; i++) {
      const row = rowData[i];
      if (!row.상품명 || !row.송장표기명 || !row.정산시모델명) {
        alert(`등록할 수 없는 빈 데이터가 있습니다. ${i + 1}번째 행을 확인해주세요.`);
        return;
      }
    }

    // 필드명을 엔티티와 일치하도록 변환
    const mappedData = rowData.map(item => ({
      productName: item.상품명 || '',
      invoiceName: item.송장표기명 || '',
      modelName: item.정산시모델명 || '',
      createdBy: userId,
      customerId: customerId,
    }));

    try {
      const response = await api.post('/api/products', mappedData);
      alert('상품이 성공적으로 등록되었습니다.');
      
    } catch (error) {
      alert('상품등록에 실패했습니다. 관리자에게 문의주세요.');
    } finally {
      navigate('/products');  // 상품관리 화면으로 이동
    }
  };

  // 컬럼 정의
  const columnDefs = [
    // { headerName: 'ID', field: 'id', editable: true },
    { headerName: '상품명', field: '상품명', editable: true, flex: 1, cellStyle: { color: 'blue', backgroundColor: '#e0f7fa', flex: 1  }  },
    { headerName: '송장표기명', field: '송장표기명', editable: true, flex: 1, cellStyle: { color: 'blue', backgroundColor: '#e0f7fa', flex: 1  }  },
    { headerName: '정산시모델명', field: '정산시모델명', editable: true, flex: 1, cellStyle: { color: 'blue', backgroundColor: '#e0f7fa', flex: 1  }  },
    // { headerName: '활성화 여부', field: 'isActive', editable: true, cellRenderer: 'booleanCellRenderer' },
  ];

  // 엑셀 파일 업로드 및 매핑
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // 첫 번째 행을 헤더로 지정
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const headers = jsonData[0]; // 첫 번째 행을 헤더로 사용
        const rows = jsonData.slice(1); // 나머지 행은 데이터로 사용

        // 헤더를 키로 매핑하여 객체 생성
        const mappedData = rows.map((row) => {
          const rowData = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index] || ''; // 값이 없으면 빈 문자열로 처리
          });
          return rowData;
        });

        setRowData(mappedData); // 상태 업데이트
      } catch (error) {
        console.error('엑셀 업로드 처리 중 오류:', error);
        alert('엑셀 데이터를 처리하는 중 문제가 발생했습니다.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // 엑셀 데이터 붙여넣기 기능
  const handlePaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData.getData('Text');
      // 빈 줄 제거
    const rows = clipboardData
    .split('\n')
    .filter((row) => row.trim() !== '') // 빈 줄 필터링
    .map((row) => row.split('\t')); // 탭으로 데이터 분리
    const newData = rows.map((row) => ({
      상품명: row[0] || '',
      송장표기명: row[1] || '',
      정산시모델명: row[2] || ''
    }));
    setRowData(newData);
  };
  
  // 전역적으로 paste 이벤트 감지
  useEffect(() => {
    const handleGlobalPaste = (e) => {
      handlePaste(e);
    };

    document.addEventListener('paste', handleGlobalPaste);

    return () => {
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
        <h3 style={styles.h3}>{customerNm} 상품등록</h3>
        </div>
        <div style={{ padding: "0px 5px", alignItems: "center", display: "flex", gap: '5px' }}>
          {/* <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="excel-upload"
          /> */}
          <label htmlFor="excel-upload">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="fileUpload"
            />
            <button style={styles.button} onClick={() => document.getElementById('fileUpload').click()}>
              엑셀 업로드
            </button>
          </label>
          <button style={styles.button} onClick={handleAddRow}>행 추가</button>
          <button style={styles.button} onClick={handleSubmit}>상품등록</button>
        </div>
      </div>

      <div className="ag-theme-alpine" 
        style={{ marginTop: '5px', width: '100%', height: '800px', backgroundColor: 'whitesmoke', padding: "0px 5px" }}>
        <AgGridReact columnDefs={columnDefs} rowData={rowData} domLayout="normal" />
      </div>
    </div>
  );
}

const styles = {
  button: {
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  h3: {
    padding: "0px 5px"
  }
};

export default NewProductRegistration;
