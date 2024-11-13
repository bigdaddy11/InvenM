import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const InvoiceManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const customerId = location.state?.customerId; 
  const customerNm = location.state?.customerNm; 

  const defaultColumns = [
    { headerName: '번호', valueGetter: 'node.rowIndex + 1', width: 80, cellStyle: { textAlign: 'center' } },
    { headerName: '상품명', field: '상품명', editable: true },
    { headerName: '수량', field: '수량', editable: true },
    { headerName: '보내는사람', field: '보내는사람', editable: true },
  ];

  const [columnDefs, setColumnDefs] = useState(defaultColumns);
  const [rowData, setRowData] = useState([]);

  const { orderId } = useParams();
  const orderData = location.state; // 행의 모든 정보가 들어있는 객체

  // 엑셀 양식 다운로드 기능
  const handleDownloadTemplate = () => {
    const fileUrl = "/InvoiceDownloadExample.xlsx"; 
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "InvoiceDownloadExample.xlsx"; // 다운로드될 파일 이름 설정
    link.click();
  };

  //등록하기
  const handleAdd = () => {
    alert("기능 준비 중...");
  };

  // 엑셀 데이터 붙여넣기 기능
  const handlePaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('Text');

    console.log(pastedData);

    if (!pastedData) return;

    const rows = pastedData.split('\n')
      .map(row => row.split('\t'))
      .filter(row => row.some(cell => cell.trim() !== '')); // 빈 행 제거

    const newData = rows.map((row) => ({
      상품명: row[0] || '',
      수량: row[1] || '',
      보내는사람: row[2] || ''
    }));

    console.log(newData);

    setRowData(newData || []); // 기본값으로 빈 배열 설정
  };

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
          defaultColumns.some(col => col.field === header)
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
      <h3 style={styles.h3}>{customerNm} 송장 업로드</h3>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px', marginBottom: 5, marginRight: 5 }}>
        <button style={styles.button} onClick={handleDownloadTemplate}>엑셀 양식 다운로드</button>
        <button style={styles.button} onClick={handleAdd}>등록하기</button>
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
      </div>
      <div
        style={{ marginTop: '5px', width: '100%', height: '800px', backgroundColor: 'whitesmoke', padding: "0px 5px" }}
        className="ag-theme-alpine"
        // onPaste={handlePaste}
      >
        <AgGridReact
          // columnDefs={[
          //   { headerName: '번호', valueGetter: 'node.rowIndex + 1', width: 80, cellStyl: { textAlign: 'center' } }, // 번호 출력
          //   { headerName: '상품명', field: 'field0', editable: true },
          //   { headerName: '수량', field: 'field1', editable: true },
          //   { headerName: '보내는사람', field: 'field2', editable: true },
          // ]}
          columnDefs={columnDefs}
          rowData={rowData}
          domLayout="normal"
          defaultColDef={{ resizable: true }}
        />
      </div>
    </div>
  );
};

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
}

export default InvoiceManagement;