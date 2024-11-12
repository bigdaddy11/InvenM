import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useNavigate } from 'react-router-dom';
import api from '../common/api'

const CustomerManagement = () => {
  const navigate = useNavigate();
  const [rowData, setRowData] = useState([]);
  const [editedRows, setEditedRows] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/customers'); // 서버에 GET 요청
      setRowData(response.data); // 응답 데이터를 상태에 저장
    } catch (error) {
      console.error('데이터 조회 오류:', error);
      alert('데이터를 불러오지 못했습니다.');
    } 
  };

  const handleEdit = async () => {
    const changedRows = Object.values(editedRows); // 수정된 행만 추출하여 배열로 변환

    if (changedRows.length === 0) {
      alert("수정된 항목이 없습니다.");
      return;
    }

    console.log("전송할 데이터:", JSON.stringify(changedRows, null, 2)); // 전송할 데이터 확인용
    
    try {
      await api.put('/api/customers/batch', changedRows);
      alert('변경 사항이 성공적으로 저장되었습니다.');
      setEditedRows({}); // 저장 후 수정된 항목 초기화
      fetchCustomers(); // 저장 후 데이터 새로 고침
    } catch (error) {
      console.error('데이터 저장 오류:', error);
      alert('변경 사항 저장에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!selectedRows.length) {
      alert("삭제할 항목을 선택해 주세요.");
      return;
    }

    // 선택된 거래처 수를 메시지에 표시
    const confirmDelete = window.confirm(`${selectedRows.length}개의 거래처를 삭제하시겠습니까?`);
    
    if (!confirmDelete) {
      return; // 취소 시 함수 종료
    }

    const idsToDeactivate = selectedRows.map(row => row.id); // 선택된 행의 ID 추출

    try {
      await api.post('/api/customers/deactivate', { ids: idsToDeactivate }); // 서버로 비활성화 요청
      alert('선택된 거래처가 삭제되었습니다.');
      fetchCustomers(); // 비활성화 후 목록 새로고침
      setSelectedRows([]); // 선택 목록 초기화
    } catch (error) {
      console.error('비활성화 오류:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const onCellValueChanged = (params) => {
    const { data } = params;
    setEditedRows((prev) => ({ ...prev, [data.id]: data })); // 수정된 전체 데이터를 저장
  };

  const onSelectionChanged = (event) => {
    setSelectedRows(event.api.getSelectedRows());
  };

  const columnDefs = [
    { headerCheckboxSelection: true, checkboxSelection: true, width: 50 },
    { headerName: '코드명', field: 'customerCode', width: 100 },
    { headerName: '거래처명', field: 'customerName', editable: true },
    { headerName: '연락처', field: 'contact', editable: true, width: 120 },
    { headerName: '주소', field: 'address', editable: true, width: 300 },
    // { headerName: '활성화 여부', field: 'isActive', editable: true, cellEditor: 'agSelectCellEditor', cellEditorParams: {
    //   values: [true, false]
    // }},
  ];

  return (
    <div>
      <h3 style={styles.h3}>거래처 관리</h3>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px', marginBottom: 5, marginRight: 5 }}>
        <button onClick={() => navigate('/customers/new')} style={styles.button}>신규등록</button>
        <button onClick={handleEdit} style={styles.button}>수정</button>
        <button onClick={handleDelete} style={styles.button}>삭제</button>
      </div>
      <div className="ag-theme-alpine" 
        style={{ marginTop: '5px', width: '100%', height: '500px', backgroundColor: 'whitesmoke', padding: "0px 5px" }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          rowSelection="multiple"
          onSelectionChanged={onSelectionChanged}
          domLayout="normal"
          defaultColDef={{ 
            resizable: true,
            cellStyle: (params) => {
              // 수정된 행은 배경색을 변경하여 시각적으로 표시
              return editedRows[params.data.id] ? { backgroundColor: '#e0f7fa', color: 'red' } : null;
            }}}
          onCellValueChanged={onCellValueChanged}
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
};

export default CustomerManagement;
