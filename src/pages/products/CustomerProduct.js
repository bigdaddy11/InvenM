import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useNavigate } from 'react-router-dom';
import api from '../common/api'

const CustomerProduct = () => {
  const navigate = useNavigate();
  const [rowData, setRowData] = useState([]);

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

  const onRowClick = (event) => {
    const customerId = event.data.id;
    const customerNm = event.data.customerName;
    navigate('/products/management', { state: { customerId, customerNm } }); // 상품관리 화면으로 이동하며 state로 전달
  };

  const columnDefs = [
    { headerName: '코드명', field: 'customerCode', width: 110, cellStyle: { cursor: 'pointer' } },
    { headerName: '거래처명', field: 'customerName', cellStyle: { cursor: 'pointer' } },
    { headerName: '연락처', field: 'contact', width: 140, cellStyle: { cursor: 'pointer' } },
    { headerName: '주소', field: 'address',  width: 320, cellStyle: { cursor: 'pointer' } },
  ];

  return (
    <div>
      <h3 style={styles.h3}>거래처 상품 관리</h3>
      <div className="ag-theme-alpine" 
        style={{ marginTop: '5px', width: '100%', height: '800px', backgroundColor: 'whitesmoke', padding: "0px 5px" }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          rowSelection="multiple"
          domLayout="normal"
          onRowClicked={onRowClick} // 행 클릭 시 화면 전환
          defaultColDef={{ 
            resizable: true
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
};

export default CustomerProduct;
