import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useLocation, useNavigate } from 'react-router-dom';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import * as XLSX from 'xlsx';
import api from '../common/api'
import '../../index.css';
import { useAuth } from '../../AuthContext';

const InvoiceManagement = () => {
  const { userId } = useAuth(); // AuthContext에서 userId 가져오기
  const location = useLocation();
  const navigate = useNavigate();

  const defaultColumns = [
    { headerCheckboxSelection: true, 
      checkboxSelection: true, 
      width: 50,
      headerStyle: { textAlign: 'center' }, // 헤더 텍스트 가운데 정렬
      
      cellStyle: (params) => {
        const style = { cursor: 'pointer', textAlign: 'center' }; // 기본 스타일 
        if (params.data.isNew) {
          style.color = 'blue'; // 새 행인 경우 글씨 색상을 파란색으로 설정
          style.backgroundColor = '#e0f7fa';
        } else if (params.data?.isUpdated) {
          style.color = "green"; // 수정된 데이터
          style.backgroundColor = "#f7ffe0";
        }
        return style;
      },
    },
    { headerName: '번호', 
      valueGetter: 'node.rowIndex + 1', 
      width: 80, 
      headerStyle: { textAlign: 'center' }, // 헤더 텍스트 가운데 정렬
      headerClass: 'header-center', // CSS 클래스 추가
      cellStyle: (params) => {
        const style = {  textAlign: 'center' }; // 기본 스타일 
        if (params.data.isNew) {
          style.color = 'blue'; // 새 행인 경우 글씨 색상을 파란색으로 설정
          style.backgroundColor = '#e0f7fa';
        } else if (params.data?.isUpdated) {
          style.color = "green"; // 수정된 데이터
          style.backgroundColor = "#f7ffe0";
        }
        return style;
      }
    }, 
    { headerName: '송장명', 
      field: 'invoiceName', 
      editable: (params) => params.data.isEditable, 
      flex: 1,
      cellStyle: (params) => {
        const style = { }; // 기본 스타일 textAlign: 'center'
        if (params.data.isNew) {
          style.color = 'blue'; // 새 행인 경우 글씨 색상을 파란색으로 설정
          style.backgroundColor = '#e0f7fa';
        } else if (params.data?.isUpdated) {
          style.color = "green"; // 수정된 데이터
          style.backgroundColor = "#f7ffe0";
        }
        return style;
      },
    },
    {
      headerName: '송장관리',
      field: 'manage',
      headerStyle: { textAlign: 'center' }, // 헤더 텍스트 가운데 정렬
      width: 100,
      cellRenderer: (params) => {
        // HTML 마크업으로 버튼 스타일 생성
        return "등록";
      },
      cellStyle: (params) => {
        const style = {
          color: 'blue', // 텍스트 색상
          textAlign: 'center', // 텍스트 가운데 정렬
          cursor: 'pointer', // 클릭 가능한 포인터
          backgroundColor: 'whitesmoke', // 배경색 설정
          borderRadius: '10px', // 버튼처럼 둥글게
        };

        return style;
      },
      onCellClicked: (params) => {
        handleRowClick(params); // 버튼 클릭 이벤트 처리
      },
    },
  ];
  const [rowData, setRowData] = useState([]);

  const fetchInvoices = async () => {
    try {
      // POST 요청으로 customerId 전달
      const response = await api.get(`/api/invoices`);
      const updatedData = response.data.map((item) => ({
        ...item,
        isEditable: true, // 기본 데이터는 수정 불가
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
  }, []);

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
      customerId: '', // 
      createdBy: userId,
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

  const handleDeleteRow = () => {
    const selectedNodes = gridRef.current.api.getSelectedNodes();
    const selectedRows = selectedNodes.map((node) => node.data);
    const updatedRows = rowData.filter((row) => !selectedRows.includes(row));
    setRowData(updatedRows);
  };

  // 송장명 수정
  const handleUpdateInvoices = async () => {
    const updatedRows = rowData.filter((row) => row.isUpdated);

    if (updatedRows.length === 0) {
      alert('수정된 데이터가 없습니다.');
      return;
    }

    const confirmUpdate = window.confirm(`${updatedRows.length}개의 데이터를 수정하시겠습니까?`);
    if (!confirmUpdate) {
      return; // 취소 시 함수 종료
    }

    // 수정할 데이터만 매핑
    const mappedData = updatedRows.map((row) => ({
      id: row.id,
      invoiceName: row.invoiceName
    }));

    try {
      await api.put('/api/invoices', mappedData); // 서버로 수정 데이터 전송
      alert('송장이 성공적으로 수정되었습니다.');
      fetchInvoices(); // 수정 후 데이터 재조회
    } catch (error) {
      console.error('수정 실패:', error);
      alert('송장 수정에 실패했습니다. 다시 시도해 주세요.');
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
      alert('추가된 행은 송장관리를 할 수 없습니다.');
      return;
    }
  
    // 기존 조회된 데이터일 경우 페이지 이동
    navigate('/invoice/management/new', {
      state: {
        invoiceId: rowData.id, // 송장 ID
        invoiceName: rowData.invoiceName, // 송장명
        customerId: '', // 거래처 ID
      },
    });
  };

  const onCellValueChanged = (params) => {
    if (params.oldValue !== params.newValue) {
      const { colDef, data } = params;
      // 수정 플래그 설정
      data.isUpdated = true;
  
      // 상태 업데이트
      setRowData([...rowData]);
    }
  };

  // 선택된 행만 엑셀 다운로드
  const handleSelectedExcelDownload = async () => {
    const selectedNodes = gridRef.current.api.getSelectedNodes(); // 선택된 행
    const selectedRows = selectedNodes.map((node) => node.data);

    if (selectedRows.length === 0) {
      alert('선택된 행이 없습니다.');
      return;
    }

    try {
      // 모든 선택된 송장의 상세 데이터를 가져옴
      const requests = selectedRows.map((row) =>
        api.get(`/api/invoice-details/${row.id}`) // 각 송장의 ID로 데이터 요청
      );

      const responses = await Promise.all(requests);

      // 엑셀 데이터 생성
      const workbook = XLSX.utils.book_new();
  
      responses.forEach((response, index) => {
        const row = selectedRows[index];
        const invoiceDetails = response.data;
  
        // 송장 데이터를 시트 데이터로 변환
        const sheetData = invoiceDetails.map((detail) => ({
          주문일자: detail.orderDate,
          주문번호: detail.orderNumber,
          거래처명: detail.customerName,
          상품코드: detail.productCode,
          송장표기명: detail.invoiceName,
          수량: detail.quantity,
          보내는사람: detail.senderName,
          보내는사람전화번호1: detail.senderPhone1,
          보내는사람전화번호2: detail.senderPhone2,
          수취인: detail.recipientName,
          수취인전화번호1: detail.recipientPhone1,
          수취인전화번호2: detail.recipientPhone2,
          수취인우편번호: detail.recipientZipcode,
          수취인주소: detail.recipientAddress,
          배송메세지: detail.deliveryMessage,
          택배사: detail.deliveryCompany,
          운송장번호: detail.trackingNumber,

        }));
  
        // 시트 생성
        const worksheet = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, row.invoiceName || `Sheet${index + 1}`); // 송장명을 탭 이름으로 설정
      });

      // 엑셀 파일 다운로드
      const fileName = `송장관리_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('엑셀 다운로드 실패:', error);
      alert('엑셀 다운로드 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }

  const gridRef = React.useRef();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3 style={styles.h3}>송장관리</h3>
        </div>
        <div style={{ padding: "0px 5px", alignItems: "center", display: "flex", gap: '5px' }}>
          <button style={styles.button} onClick={handleAddRow}>행 추가</button>
          <button style={styles.button} onClick={handleDeleteRow}>행 삭제</button>
          <button style={styles.button} onClick={handleRegisterInvoices}>송장명등록</button>
          <button style={styles.button} onClick={handleUpdateInvoices}>송장명수정</button>
          <button style={styles.button} onClick={handleDelete}>송장명삭제</button>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px', marginBottom: 5, marginRight: 5 }}>
          <button style={styles.button} onClick={handleSelectedExcelDownload}>선택 엑셀 다운로드</button>
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
          onCellValueChanged={onCellValueChanged} // 수정 시 이벤트 처리
          defaultColDef={{ 
            resizable: true ,
            sortable: true,
            cellStyle: (params) => {
              const style = {};
              if (params.data?.isNew) {
                style.color = 'blue'; // 새 행인 경우 글씨 색상 설정
                style.backgroundColor = '#e0f7fa'; // 새 행인 경우 배경색 설정
              } else if (params.data?.isUpdated) {
                style.color = "green"; // 수정된 데이터
                style.backgroundColor = "#f7ffe0";
              }
              return style;
            },
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