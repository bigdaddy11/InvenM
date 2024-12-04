import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import api from '../common/api'
import { useAuth } from '../../AuthContext';

const InvoiceManagementRegistration = () => {
  const { userId } = useAuth(); // AuthContext에서 userId 가져오기
  const location = useLocation();

  const [isUploading, setIsUploading] = useState(false);
  
  const { invoiceId, invoiceName } = location.state || {};
  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    if (invoiceId) fetchInvoiceDetails();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/customers'); // 서버에 GET 요청
      setCustomers(response.data); // 응답 데이터를 상태에 저장
      //console.log(customers);
    } catch (error) {
      console.error('데이터 조회 오류:', error);
      alert('데이터를 불러오지 못했습니다.');
    } 
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products'); // 서버에 GET 요청
      setProducts(response.data); // 응답 데이터를 상태에 저장
      //console.log(products);
    } catch (error) {
      console.error('데이터 조회 오류:', error);
      alert('데이터를 불러오지 못했습니다.');
    } 
  };

  const defaultColumns = [
    { headerCheckboxSelection: true, 
      checkboxSelection: true, 
      width: 50 ,
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
      }
    },
    { 
      headerName: '번호', 
      valueGetter: 'node.rowIndex + 1', 
      width: 80, 
      cellStyle: (params) => {
        const style = { textAlign: 'center' }; // 기본 스타일
        if (params.data?.isNew) {
          style.color = 'blue'; // 새 행인 경우 글씨 색상
          style.backgroundColor = '#e0f7fa'; // 새 행인 경우 배경색
        } else if (params.data?.isUpdated) {
          style.color = 'green'; // 수정된 행인 경우 글씨 색상
          style.backgroundColor = '#f7ffe0'; // 수정된 행인 경우 배경색
        }
        return style;
      }
    },
    { 
      headerName: '주문일자', 
      field: '주문일자', 
      editable: true,
      cellEditor: 'agDateCellEditor', // 날짜 선택기 활성화
      cellEditorParams: {
        // 날짜 선택 팝업 설정
        min: '2000-01-01',
        max: '2099-12-31',
        format: 'yyyy-MM-dd',
      },
      valueFormatter: (params) => {
        if (params.value) {
          const date = new Date(params.value);
          return date.toISOString().split('T')[0]; // yyyy-MM-dd 형식으로 표시
        }
        return '';
      },
      valueSetter: (params) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // yyyy-MM-dd 형식 검증
        if (dateRegex.test(params.newValue)) {
          params.data[params.colDef.field] = params.newValue;
          return true;
        } else {
          alert('올바른 날짜 형식(yyyy-MM-dd)으로 입력해주세요.');
          return false;
        }
      },
    },
    { headerName: '주문번호', field: '주문번호', editable: true },
    { headerName: '거래처명', field: '거래처명', editable: false },
    { headerName: '상품코드', field: '상품코드', editable: true },
    { headerName: '송장표기명', field: '송장표기명', editable: false },
    { headerName: '수량', field: '수량', editable: true, 
      valueSetter: (params) => {
      const newValue = params.newValue.trim(); // 공백 제거
      const parsedValue = parseInt(newValue, 10);
  
      if (isNaN(parsedValue)) {
        alert('수량은 숫자만 입력 가능합니다.');
        return false; // 변경 취소
      }
  
      params.data[params.colDef.field] = parsedValue; // 숫자로 저장
      return true; // 변경 허용
    },
    valueFormatter: (params) => {
      return params.value || ''; // 값이 없으면 빈 문자열로 표시
    }, },
    { headerName: '보내는사람', field: '보내는사람', editable: true },
    { headerName: '보내는사람전화번호1', field: '보내는사람전화번호1', editable: true },
    { headerName: '보내는사람전화번호2', field: '보내는사람전화번호2', editable: true },
    { headerName: '수취인', field: '수취인', editable: true },
    { headerName: '수취인전화번호1', field: '수취인전화번호1', editable: true },
    { headerName: '수취인전화번호2', field: '수취인전화번호2', editable: true },
    { headerName: '수취인우편번호', field: '수취인우편번호', editable: true },
    { headerName: '수취인주소', field: '수취인주소', editable: true },
    { headerName: '배송메세지', field: '배송메세지', editable: true },
    { headerName: '택배사', field: '택배사', editable: true },
    { headerName: '운송장번호', field: '운송장번호', editable: true },
    { field: 'id', hide: true }, // 숨겨진 id 필드 추가
    { headerName: 'customerId', field: 'customerId', hide: true }, // 숨겨진 id 필드 추가
  ];

  const [columnDefs, setColumnDefs] = useState(defaultColumns);
  const [rowData, setRowData] = useState([]);
  const [customers, setCustomers] =  useState([]);
  const [products, setProducts] =  useState([]);

  const handleAddRow = () => {
    const newRow = {
      주문일자: '',
      주문번호: '',
      송장표기명: '',
      수량: 1,
      보내는사람: '',
      보내는사람전화번호1: '',
      보내는사람전화번호2: '',
      수취인: '',
      수취인전화번호1: '',
      수취인전화번호2: '',
      수취인우편번호: '',
      수취인주소: '',
      배송메세지: '',
      택배사: '',
      운송장번호: '',
      상품코드: '',
      isNew: true,
    };
    setRowData([...rowData, newRow]);
  };

  const handleDeleteRow = () => {
    const selectedNodes = gridRef.current.api.getSelectedNodes();
    const selectedRows = selectedNodes.map((node) => node.data);
    const updatedRows = rowData.filter((row) => !selectedRows.includes(row));
    setRowData(updatedRows);
  };

  const handleRegister = async () => {
    const newRows = rowData.filter((row) => row.isNew);

    if (newRows.length === 0) {
      alert('등록할 데이터가 없습니다.');
      return;
    }

    // 필수 필드 검증: customerId와 productCode
    const invalidRows = newRows.filter((row, index) => !row.customerId || !row.상품코드);
    console.log(invalidRows);
    if (invalidRows.length > 0) {
        const invalidRowIndices = invalidRows.map((row) => rowData.indexOf(row) + 1); // 1-based index
        alert(`다음 행에서 필수 값이 누락되었습니다: ${invalidRowIndices.join(', ')}행`);
        return; // 등록 중단
    }

    // 변경 될 상품 수를 메시지에 표시
    const confirmAdd = window.confirm(`${newRows.length}개의 송장 내용을 등록 하시겠습니까?`);
    
    if (!confirmAdd) {
      return; // 취소 시 함수 종료
    }

    const mappedData = newRows.map((row) => ({
      customerId: row.customerId, // 거래처 ID
      invoiceId: invoiceId,   // 송장 ID
      orderDate: row.주문일자,
      orderNumber: row.주문번호,
      invoiceName: row.송장표기명,
      quantity: row.수량,
      senderName: row.보내는사람,
      senderPhone1: row.보내는사람전화번호1,
      senderPhone2: row.보내는사람전화번호2,
      recipientName: row.수취인,
      recipientPhone1: row.수취인전화번호1,
      recipientPhone2: row.수취인전화번호2,
      recipientZipcode: row.수취인우편번호,
      recipientAddress: row.수취인주소,
      deliveryMessage: row.배송메세지,
      deliveryCompany: row.택배사,
      trackingNumber: row.운송장번호,
      productCode: row.상품코드,
      isNew: true, // 신규 플래그
      createdBy: userId,
    }));

    try {
      // API 등록 요청
      const response = await api.post("/api/invoice-details/register", mappedData);
      alert(response.data); // 성공 메시지 출력
      fetchInvoiceDetails(); // 등록 후 데이터를 다시 불러오기
    } catch (error) {
      alert('송장 내용 등록에 실패했습니다.');
    }
  };

  const handleEditRow = async () => {
    const updatedRows = rowData.filter((row) => row.isUpdated);

    if (updatedRows.length === 0) {
      alert("수정된 데이터가 없습니다.");
      return;
    }

    const invalidRows = updatedRows.filter((row) => !row.id);
    if (invalidRows.length > 0) {
      alert(`ID가 없는 데이터가 있습니다: ${invalidRows.length}개의 행`);
      return;
    }

    // 변경 될 상품 수를 메시지에 표시
    const confirmEdit = window.confirm(`${updatedRows.length}개의 데이터를 수정하시겠습니까?`);

    if (!confirmEdit) {
      return; // 취소 시 함수 종료
    }
    
    const mappedData = updatedRows.map((row) => ({
      id: row.id,
      customerId: row.customerId, // 거래처 ID
      invoiceId: invoiceId,   // 송장 ID
      orderDate: row.주문일자,
      orderNumber: row.주문번호,
      invoiceName: row.송장표기명,
      quantity: row.수량,
      senderName: row.보내는사람,
      senderPhone1: row.보내는사람전화번호1,
      senderPhone2: row.보내는사람전화번호2,
      recipientName: row.수취인,
      recipientPhone1: row.수취인전화번호1,
      recipientPhone2: row.수취인전화번호2,
      recipientZipcode: row.수취인우편번호,
      recipientAddress: row.수취인주소,
      deliveryMessage: row.배송메세지,
      deliveryCompany: row.택배사,
      trackingNumber: row.운송장번호,
      productCode: row.상품코드,
      isNew: false, // 신규 플래그
      createdBy: userId,
    }));

    try {
      const response = await api.put("/api/invoice-details/batch", mappedData); // 서버로 수정 데이터 전송
      alert(response.data); // 성공 메시지 출력
      fetchInvoiceDetails(); // 수정 후 데이터를 다시 불러오기
    } catch (error) {
      console.error("수정 실패:", error);
      alert("송장 수정에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  const handleDeleteInvoice = async () => {
    const selectedNodes = gridRef.current.api.getSelectedNodes(); // 선택된 행 가져오기
    const selectedRows = selectedNodes.map((node) => node.data);

  if (selectedRows.length === 0) {
    alert("삭제할 항목을 선택해주세요.");
    return;
  }

  const confirmDelete = window.confirm(
    `${selectedRows.length}개의 항목을 삭제하시겠습니까?`
    );
    if (!confirmDelete) return;

    try {
      const idsToDelete = selectedRows.map((row) => row.id); // 삭제할 ID만 추출
      await api.delete("/api/invoice-details", {
        data: idsToDelete, // DELETE 요청에 데이터 포함
      });

      alert("선택된 항목이 삭제되었습니다.");
      // 클라이언트 상태 업데이트
      setRowData((prevRowData) =>
        prevRowData.filter((row) => !idsToDelete.includes(row.id))
      );
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const fetchInvoiceDetails = async () => {
    try {
      const response = await api.get(`/api/invoice-details/${invoiceId}`);
      const mappedData = response.data.map((item) => ({
        주문일자: item.orderDate || "",
        주문번호: item.orderNumber || "",
        송장표기명: item.invoiceName || "",
        수량: item.quantity || "",
        보내는사람: item.senderName || "",
        보내는사람전화번호1: item.senderPhone1 || "",
        보내는사람전화번호2: item.senderPhone2 || "",
        수취인: item.recipientName || "",
        수취인전화번호1: item.recipientPhone1 || "",
        수취인전화번호2: item.recipientPhone2 || "",
        수취인우편번호: item.recipientZipcode || "",
        수취인주소: item.recipientAddress || "",
        배송메세지: item.deliveryMessage || "",
        택배사: item.deliveryCompany || "",
        운송장번호: item.trackingNumber || "",
        상품코드 : item.productCode || "",
        거래처명 : item.customerName || "",
        id: item.id || "",
      }));
      setRowData(mappedData);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
    }
  };

  const gridRef = React.useRef();

  

  // 엑셀 양식 다운로드 기능
  const handleDownloadTemplate = () => {
    const fileUrl = "/InvoiceDownloadExample.xlsx"; 
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "InvoiceDownloadExample.xlsx"; // 다운로드될 파일 이름 설정
    link.click();
  };

  // 거래처/상품 맵핑
const handleMapping = () => {
  if (!products || !customers) {
    alert('상품 데이터나 거래처 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    return;
  }

  const updatedRows = rowData.map((row) => {
    // isNew가 true인 경우에만 처리
    if (row.isNew && row['상품코드']) {
      const matchedProduct = products.find((product) => product.productCode.trim().toLowerCase() === row['상품코드'].trim().toLowerCase());
      if (matchedProduct) {
        const matchedCustomer = customers.find((customer) => customer.id === matchedProduct.customerId);

        return {
          ...row,
          '거래처명': matchedCustomer ? matchedCustomer.customerName : '', // 거래처명 매핑
          'customerId': matchedCustomer ? matchedCustomer.id : '', // 거래처 ID 매핑
          '송장표기명': matchedProduct.invoiceName || '', // 송장표기명 매핑
        };
      } else {
        return {
          ...row,
          '거래처명': '',
          'customerId': '',
          '송장표기명': '',
        };
      }
    }
    return row; // isNew가 false인 경우 원본 데이터 유지
  });

    setRowData(updatedRows); // 상태 업데이트
    //alert('거래처명과 송장표기명 매핑이 완료되었습니다.');
  };

  // 엑셀 다운로드 기능
  const handleDownloadExcel = () => {
    if (rowData.length === 0) {
      alert('다운로드할 데이터가 없습니다.');
      return;
    }
     // 1. 컬럼 헤더 정의 (체크박스 컬럼 제외)
    const columnHeaders = columnDefs
      .filter((col) => col.field) // 필드가 있는 컬럼만 포함
      .map((col) => col.headerName);

     // 2. 데이터 매핑 (체크박스 컬럼 제외)
    const excelData = rowData.map((row) =>
      columnDefs.reduce((acc, col) => {
        if (col.field  && !col.hide) { // 필드가 있는 경우만 추가
          acc[col.headerName] = row[col.field] || ''; // 헤더 이름과 필드 매핑
        }
        return acc;
      }, {})
    );
 
     // 3. 워크시트 생성
     const worksheet = XLSX.utils.json_to_sheet(excelData, { header: columnHeaders });
 
     // 4. 워크북 생성 및 워크시트 추가
     const workbook = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(workbook, worksheet, invoiceName);
 
     // 5. 엑셀 파일 다운로드
     XLSX.writeFile(workbook, invoiceName+`_송장_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const onCellValueChanged = (params) => {
    if (params.oldValue !== params.newValue) {
      const { colDef, data } = params;
      
      if (!products || !customers) {
        alert('상품 데이터나 거래처 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      if (colDef.field === '상품코드') {
        const matchedProduct = products.find((product) => product.productCode === params.newValue);
  
        if (matchedProduct) {
          // 상품코드에 해당하는 거래처 및 송장표기명 자동 설정
          const matchedCustomer = customers.find((customer) => customer.id === matchedProduct.customerId);
          data['거래처명'] = matchedCustomer ? matchedCustomer.customerName : ''; // 거래처명 매핑
          data['customerId'] = matchedCustomer ? matchedCustomer.id : ''; // 거래처 ID 매핑
          data['송장표기명'] = matchedProduct.invoiceName || ''; // 송장표기명 매핑
        } else {
          // 매칭되는 상품코드가 없을 경우 초기화
          data['거래처명'] = '';
          data['송장표기명'] = '';
          data['customerId'] = '';
        }
      }
  
      // 수정 플래그 설정
      data.isUpdated = true;
  
      // 상태 업데이트
      setRowData([...rowData]);
    }
  };

  // 데이터 붙여넣기 처리
  const handlePaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('Text');

    if (!pastedData) return;

    const rows = pastedData
      .split('\n')
      .map((row) => row.split('\t'))
      .filter((row) => row.some((cell) => cell.trim() !== '')); // 빈 행 제거

    setRowData((prevRowData) => {
      const newRowData = rows.map((row) => {
        const rowData = {
          주문일자: row[0] || '',
          주문번호: row[1] || '',
          상품명: row[2] || '',
          수량: row[3] || '',
          보내는사람: row[4] || '',
          보내는사람전화번호1: row[5] || '',
          보내는사람전화번호2: row[6] || '',
          수취인: row[7] || '',
          수취인전화번호1: row[8] || '',
          수취인전화번호2: row[9] || '',
          수취인우편번호: row[10] || '',
          수취인주소: row[11] || '',
          배송메세지: row[12] || '',
          택배사: row[13] || '',
          운송장번호: row[14] || '',
          상품코드: '', // 상품코드는 아래에서 매핑
          isNew: true, // 새 데이터로 플래그 설정
        };

        return rowData;
      });

      return [...prevRowData, ...newRowData];
    });
  };

  // 엑셀 파일 업로드 및 매핑
const handleFileUpload = (e) => {
  if (isUploading) {
    return;
  }
  setIsUploading(true);

  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const headers = jsonData[0]; // 첫 번째 행: 헤더
      const rows = jsonData.slice(1); // 나머지 행: 데이터

      // 컬럼 맵핑만 진행
      const newRowData = rows.map((row) => {
        const rowData = {};

        headers.forEach((header, index) => {
          const cellValue = row[index] || ''; // 각 셀의 값을 맵핑
          rowData[header] = cellValue; // 헤더를 키로, 셀 값을 값으로 설정
        });

        rowData.isNew = true; // 신규 데이터 플래그 설정
        return rowData;
      });

      // 상태 업데이트
      setRowData((prev) => {
        const updatedData = [...prev, ...newRowData];
        console.log('Updated Row Data:', updatedData); // 디버깅 로그
        return updatedData;
      });
    } catch (error) {
      console.error('엑셀 업로드 처리 중 오류:', error);
      alert('엑셀 데이터를 처리하는 중 문제가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
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
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3 style={styles.h3}>[{invoiceName}] 등록</h3>
        </div>
        <div style={{ padding: "0px 5px", alignItems: "center", display: "flex", gap: '5px' }}>
          <button style={styles.button} onClick={handleAddRow}>행 추가</button>
          <button style={styles.button} onClick={handleDeleteRow}>행 삭제</button>
          <button style={styles.button} onClick={handleEditRow}>수정하기</button>
          <button style={styles.button} onClick={handleDeleteInvoice}>삭제하기</button>
          <button style={styles.button} onClick={handleRegister}>등록하기</button>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px', marginBottom: 5, marginRight: 5 }}>
        <button style={styles.button} onClick={handleMapping}>거래처/상품 맵핑</button>
        <button style={styles.button} onClick={handleDownloadTemplate}>엑셀 양식 다운로드</button>
        <button style={styles.button} onClick={handleDownloadExcel}>엑셀 다운로드</button>
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
        style={{ marginTop: '5px', width: '100%', height: '750px', backgroundColor: 'whitesmoke', padding: "0px 5px" }}
        className="ag-theme-alpine"
        // onPaste={handlePaste}
      >
        <AgGridReact
          ref={gridRef}
          columnDefs={columnDefs}
          rowData={rowData}
          domLayout="normal"
          rowSelection="multiple"
          defaultColDef={{ 
            resizable: true,
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
          onCellValueChanged={onCellValueChanged} // 수정 시 이벤트 처리
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

export default InvoiceManagementRegistration;