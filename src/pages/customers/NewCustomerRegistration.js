// NewCustomerRegistration.js

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import api from '../common/api'
import { useNavigate } from 'react-router-dom';

function NewCustomerRegistration() {
  const [rowData, setRowData] = useState([]);
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
    const newRow = { id: '', name: '', contact: '', address: '', isActive: true };
    setRowData([...rowData, newRow]);
  };

   // 서버에 데이터 전송
   const handleSubmit = async () => {
    if (rowData.length === 0) {
      alert('등록할 데이터가 없습니다. 데이터를 입력해 주세요.');
      return;
    }

    // 필드명을 엔티티와 일치하도록 변환
    const mappedData = rowData.map(item => ({
      customerName: item.거래처명 || '',
      contact: item.연락처 || '',
      address: item.주소 || '',
      createdBy: "S07237",
    }));

    try {
      const response = await api.post('/api/customers', mappedData);
      alert('거래처 정보가 성공적으로 등록되었습니다.');
      navigate('/');  // 거래처 관리 화면으로 이동
    } catch (error) {
      alert('거래처 등록에 실패했습니다. 관리자에게 문의주세요.');
    }
  };

  // 컬럼 정의
  const columnDefs = [
    // { headerName: 'ID', field: 'id', editable: true },
    { headerName: '거래처명', field: '거래처명', editable: true },
    { headerName: '연락처', field: '연락처', editable: true },
    { headerName: '주소', field: '주소', editable: true },
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
      거래처명: row[0] || '',
      연락처: row[1] || '',
      주소: row[2] || ''
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
      <h3 style={styles.h3}>거래처 신규등록</h3>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px', marginBottom: 5, marginRight: 5 }}>
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
        <button style={styles.button} onClick={handleSubmit}>업체등록</button>
      </div>
      <div className="ag-theme-alpine" 
        style={{ marginTop: '5px', width: '100%', height: '500px', backgroundColor: 'whitesmoke', padding: "0px 5px" }}>
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

export default NewCustomerRegistration;