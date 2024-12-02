import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useNavigate } from 'react-router-dom';
import api from '../common/api'
import * as XLSX from 'xlsx';

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

  const handleDownloadExcel = async () => {
    if (!rowData || rowData.length === 0) {
      alert('다운로드할 데이터가 없습니다.');
      return;
    }

    try {
      // 모든 거래처의 상품 데이터를 가져옴
      const requests = rowData.map((customer) =>
        api.get(`/api/products/${customer.id}`) // 거래처 ID로 상품 데이터 요청
      );
      const responses = await Promise.all(requests);

      // 엑셀 데이터 생성
      const workbook = XLSX.utils.book_new();

      responses.forEach((response, index) => {
        const customer = rowData[index];
        const products = response.data;

        // 상품 데이터를 시트 데이터로 변환
        const sheetData = products.map((product) => ({
          상품코드: product.productCode,
          상품명: product.productName,
          송장표기: product.invoiceName,
          정산시모델명: product.modelName,
        }));

        // 시트 생성
        const worksheet = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, customer.customerName); // 거래처명을 탭 이름으로 설정
      });

      // 엑셀 파일 다운로드
      const fileName = `전체_거래처별_상품관리_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('엑셀 다운로드 실패:', error);
      alert('엑셀 다운로드에 실패했습니다.');
    }
  };

  const columnDefs = [
    { headerName: '코드명', field: 'customerCode', width: 110, cellStyle: { cursor: 'pointer' } },
    { headerName: '거래처명', field: 'customerName', width: 300, cellStyle: { cursor: 'pointer' } },
    { headerName: '연락처', field: 'contact', width: 200, cellStyle: { cursor: 'pointer' } },
    { headerName: '주소', field: 'address',  flex: 1 , cellStyle: { cursor: 'pointer' } },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3>거래처 상품 관리</h3>
        </div>
        <div style={{ padding: "0px 5px", alignItems: "center", display: "flex", gap: '5px' }}>
          <button onClick={handleDownloadExcel} style={styles.button}>전체 엑셀 다운로드</button>  
        </div>
      </div>
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
