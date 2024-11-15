import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useLocation, useNavigate } from 'react-router-dom';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import api from '../common/api'

const InvoiceManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const customerId = location.state?.customerId; 
  const customerNm = location.state?.customerNm; 

  const defaultColumns = [
    { headerCheckboxSelection: true, 
      checkboxSelection: true, 
      width: 50 ,
      cellStyle: (params) => {
        const style = { cursor: 'pointer', textAlign: 'center' }; // 기본 스타일 
        if (params.data.isNew) {
          style.color = 'blue'; // 새 행인 경우 글씨 색상을 파란색으로 설정
          style.backgroundColor = '#e0f7fa';
        }
        return style;
      }
    },
    { headerName: '번호', 
      valueGetter: 'node.rowIndex + 1', 
      width: 80, 
      cellStyle: (params) => {
        const style = {  textAlign: 'center' }; // 기본 스타일 
        if (params.data.isNew) {
          style.color = 'blue'; // 새 행인 경우 글씨 색상을 파란색으로 설정
          style.backgroundColor = '#e0f7fa';
        }
        return style;
      }
    }, 
    { headerName: '송장명', 
      field: 'invoiceName', 
      editable: (params) => params.data.isEditable, 
      width: "700", 
      cellStyle: (params) => {
        const style = { }; // 기본 스타일 textAlign: 'center'
        if (params.data.isNew) {
          style.color = 'blue'; // 새 행인 경우 글씨 색상을 파란색으로 설정
          style.backgroundColor = '#e0f7fa';
        }
        return style;
      },
    },
    {
      headerName: '관리',
      field: 'manage',
      width: 100,
    },
  ];
  const [rowData, setRowData] = useState([]);

  const fetchInvoices = async () => {
    if (!customerId) {
      console.error('Customer ID가 없습니다.');
      return;
    }

    try {
      // POST 요청으로 customerId 전달
      const response = await api.get(`/api/invoices/${customerId}`);
      const updatedData = response.data.map((item) => ({
        ...item,
        isEditable: false, // 기본 데이터는 수정 불가
        isNew: false, // 기존 데이터는 새로 추가된 데이터가 아님
      }));
      setRowData(updatedData);
    } catch (error) {
      console.error('송장 데이터 조회 실패:', error);
      alert('송장 데이터를 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [customerId]);

  // 행 추가
  const handleAddRow = () => {
    setRowData([
      ...rowData,
      { 송장명: '', 발송일자: '', isEditable: true, isNew: true } // Default empty row
    ]);
  };

  // 송장 등록
  const handleRegisterInvoices = async () => {

    const newRows = rowData.filter((row) => row.isNew);

    if (newRows.length === 0) {
      alert('등록할 데이터가 없습니다. 데이터를 입력해 주세요.');
      return;
    }

    // 송장명 필수 입력 체크
    const invalidRows = newRows
      .map((row) => rowData.indexOf(row) + 1) // 전체 rowData에서의 1-based index 계산
      .filter((rowIndex) => !rowData[rowIndex - 1].invoiceName); // 송장명이 없는 행 필터링

    if (invalidRows.length > 0) {
      alert(`송장명은 필수 입력입니다. ${invalidRows.join(', ')} 행`);
      return;
    }

    // 선택된 거래처 수를 메시지에 표시
    const confirmAdd = window.confirm(`${newRows.length}개의 데이터를 등록하시겠습니까?`);
    
    if (!confirmAdd) {
      return; // 취소 시 함수 종료
    }

    // 필드명 변환 (서버 엔티티와 일치)
    const mappedData = newRows.map(row => ({
      invoiceName: row.invoiceName,
      sentDate: row.sentDate,
      customerId: customerId, // 거래처 ID 추가
      createdBy: "S07237"
    }));

    try {
      await api.post('/api/invoices', mappedData); // 서버로 데이터 전송
      alert('송장이 성공적으로 등록되었습니다.');
      fetchInvoices(); // 등록 후 데이터를 다시 불러옵니다.
    } catch (error) {
      console.error('등록 실패:', error);
      alert('송장 등록에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleDelete = async () => {
    // 선택된 행 가져오기
    const selectedNodes = gridRef.current.api.getSelectedNodes();
    const selectedRows = selectedNodes.map((node) => node.data);

    if (selectedRows.length === 0) {
      alert('삭제할 항목을 선택해 주세요.');
      return;
    }

    // 추가된 행 (isNew: true) 확인
  const newRows = selectedRows.filter((row) => row.isNew);
  if (newRows.length > 0) {
    const newRowIndexes = newRows.map((row) => rowData.indexOf(row) + 1); // 1-based index
    alert(`추가된 행은 삭제할 수 없습니다. 삭제 불가능한 행 번호: ${newRowIndexes.join(', ')}`);
    return;
  }

    const confirmDelete = window.confirm(`${selectedRows.length}개의 송장을 삭제하시겠습니까?`);
    if (!confirmDelete) return;

    try {
      const selectedIds = selectedRows.map((row) => row.id);
      await api.post('/api/invoices/delete', { ids: selectedIds });
      alert('선택된 송장이 삭제되었습니다.');
      // 삭제 후 화면 갱신
      setRowData(rowData.filter((row) => !selectedIds.includes(row.id)));
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('송장 삭제에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleRowClick = (event) => {
    const rowData = event.data;
  
    // 추가된 행인지 확인
    if (rowData.isNew) {
      alert('추가된 행은 선택할 수 없습니다.');
      return;
    }
  
    // 기존 조회된 데이터일 경우 페이지 이동
    navigate('/invoice/management/new', {
      state: {
        invoiceId: rowData.id, // 송장 ID
        invoiceName: rowData.invoiceName, // 송장명
        customerId: customerId, // 거래처 ID
      },
    });
  };

  const gridRef = React.useRef();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3 style={styles.h3}>[{customerNm}] 송장관리</h3>
        </div>
        <div style={{ padding: "0px 5px", alignItems: "center", display: "flex", gap: '5px' }}>
          <button style={styles.button} onClick={handleAddRow}>행 추가</button>
          <button style={styles.button} onClick={handleRegisterInvoices}>송장등록</button>
          <button style={styles.button} onClick={handleDelete}>송장삭제</button>
        </div>
      </div>
      <div
        style={{ marginTop: '5px', width: '100%', height: '800px', backgroundColor: 'whitesmoke', padding: "0px 5px" }}
        className="ag-theme-alpine"
        // onPaste={handlePaste}
      >
        <AgGridReact
          ref={gridRef}
          columnDefs={defaultColumns}
          rowData={rowData}
          rowSelection="multiple"
          domLayout="normal"
          onRowClicked={handleRowClick} // 행 클릭 이벤트 처리
          defaultColDef={{ 
            resizable: false ,
            sortable: true,
            
          }}
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