import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const Invoice = () => {
    const navigate = useNavigate();

    // 그리드의 더미 데이터
    const rowData = [
      { id: 1, orderNumber: 'PO12345', supplier: '신협', date: '2024-10-01' },
      { id: 2, orderNumber: 'PO12346', supplier: '축협', date: '2024-10-05' },
      { id: 2, orderNumber: 'PO12346', supplier: '신한', date: '2024-10-05' },
    ];
  
    // 행 클릭 시 Excel.js로 이동하는 함수
    const handleRowClick = (params) => {
      const rowData = params.data; // 클릭한 행의 ID 가져오기
      navigate(`/excel`, {state: rowData}); // Excel.js로 이동하면서 orderId 전달
    };
  
    return (
      <div>
        <h3 style={{padding: "0px 5px"}}>발주 관리</h3>
        <div className="ag-theme-alpine" 
            style={{ marginTop: '5px', width: '100%', height: '500px', backgroundColor: 'whitesmoke', padding: "0px 5px" }}
        >
          <AgGridReact
            columnDefs={[
              { headerName: '번호', valueGetter: 'node.rowIndex + 1', width: 80, cellStyl: { textAlign: 'center' } }, // 번호 출력
              { headerName: '주문번호', field: 'orderNumber', width: 150 },
              { headerName: '판매사', field: 'supplier', width: 150 },
              { headerName: '발주일자', field: 'date', width: 150 }
            ]}
            rowData={rowData}
            domLayout="normal"
            defaultColDef={{ flex: 1, resizable: true }}
            onRowClicked={handleRowClick} // 행 클릭 이벤트 처리
          />
        </div>
      </div>
    );
};

export default Invoice;