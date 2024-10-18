import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useParams, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const Excel = () => {
  const [rowData, setRowData] = useState([]);

  const { orderId } = useParams();
  const location = useLocation(); // 전달된 state 접근
  const orderData = location.state; // 행의 모든 정보가 들어있는 객체

  // 엑셀 양식 다운로드 기능
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { "상품명": "", "수량": "", "보내는사람": "" }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "template.xlsx");
  };

  //등록하기
  const handleAdd = () => {
    alert("기능 준비 중...");
  };

  // 엑셀 데이터 붙여넣기 기능
  const handlePaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData.getData('Text');
    const rows = clipboardData.split('\n').map(row => row.split('\t'));
    const newData = rows.map((row) => ({
      header1: row[0] || '',
      header2: row[1] || '',
      header3: row[2] || ''
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
      <h3 style={{padding: "0px 5px"}}>{orderData.supplier} 송장 업로드</h3>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "0px 5px" }}>
        <button style={styles.buttonCustom} onClick={handleDownloadTemplate}>엑셀 양식 다운로드</button>
        <button style={styles.buttonCustom} onClick={handleAdd}>등록하기</button>
      </div>
      <div
        style={{ marginTop: '5px', width: '100%', height: '500px', backgroundColor: 'whitesmoke', padding: "0px 5px" }}
        className="ag-theme-alpine"
        // onPaste={handlePaste}
      >
        <AgGridReact
          columnDefs={[
            { headerName: '번호', valueGetter: 'node.rowIndex + 1', width: 80, cellStyl: { textAlign: 'center' } }, // 번호 출력
            { headerName: '상품명', field: 'header1', editable: true },
            { headerName: '수량', field: 'header2', editable: true },
            { headerName: '보내는사람', field: 'header3', editable: true },
          ]}
          rowData={rowData}
          domLayout="normal"
          defaultColDef={{ resizable: true }}
        />
      </div>
    </div>
  );
};

const styles = {
  buttonCustom: {
    margin: 1
  }
}

export default Excel;