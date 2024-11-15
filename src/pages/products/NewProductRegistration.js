// NewCustomerRegistration.js

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import api from '../common/api'
import { useLocation, useNavigate } from 'react-router-dom';

function NewProductRegistration() {
  const location = useLocation();
  const [rowData, setRowData] = useState([]);

  const customerId = location.state?.customerId; // 전달받은 customerId
  const customerNm = location.state?.customerNm; // 전달받은 customerId
  const navigate = useNavigate();


  // 엑셀 업로드 핸들러
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setRowData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

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

    // 필드명을 엔티티와 일치하도록 변환
    const mappedData = rowData.map(item => ({
      productName: item.상품명 || '',
      invoiceName: item.송장표기 || '',
      modelName: item.정산시모델명 || '',
      createdBy: "S07237",
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
    { headerName: '상품명', field: '상품명', editable: true, width: 250, cellStyle: { color: 'blue', backgroundColor: '#e0f7fa', textAlign: 'center', flex: 1  }  },
    { headerName: '송장표기', field: '송장표기', editable: true, width: 250, cellStyle: { color: 'blue', backgroundColor: '#e0f7fa', textAlign: 'center', flex: 1  }  },
    { headerName: '정산시모델명', field: '정산시모델명', editable: true, width: 250, cellStyle: { color: 'blue', backgroundColor: '#e0f7fa', textAlign: 'center', flex: 1  }  },
    // { headerName: '활성화 여부', field: 'isActive', editable: true, cellRenderer: 'booleanCellRenderer' },
  ];

  // 엑셀 파일 업로드 및 매핑
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // 첫 번째 행을 컬럼 이름으로 가져오기
      const headers = jsonData[0];
      const rows = jsonData.slice(1);

      // 기본 컬럼과 일치하는 컬럼만 사용
      const allowedHeaders = headers.filter(header => 
        columnDefs.some(col => col.field === header)
      );

      // rowData 생성 - 기본 컬럼에 해당하는 데이터만 매핑
      const newRowData = rows.map((row) => {
        const rowData = {};
        allowedHeaders.forEach((header, index) => {
          rowData[header] = row[index] || ''; // 컬럼 이름과 매칭되는 데이터 매핑
        });
        return rowData;
      });

      setRowData(newRowData);
    };

    reader.readAsArrayBuffer(file);
  };

  // 엑셀 데이터 붙여넣기 기능
  const handlePaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData.getData('Text');
    const rows = clipboardData.split('\n').map(row => row.split('\t'));
    const newData = rows.map((row) => ({
      상품명: row[0] || '',
      송장표기: row[1] || '',
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
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleExcelUpload}
            style={{ display: 'none' }}
            id="excel-upload"
          />
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
