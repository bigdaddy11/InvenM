import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import api from '../common/api'

const InvoiceManagementRegistration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { invoiceId, invoiceName, customerId } = location.state || {};
  const [ products, setProducts] = useState([]); // 거래처 상품 데이터
  const productsRef = useRef([]);

  useEffect(() => {
    if (invoiceId) fetchInvoiceDetails();
  }, [invoiceId]);

  // 거래처 상품 데이터 가져오기
  const fetchProducts = async () => {
      if (!customerId) return;
      try {
        const response = await api.get(`/api/products/${customerId}`);
        setProducts(response.data); // 상품 데이터 저장
      } catch (error) {
        console.error('상품 데이터 조회 실패:', error);
        alert('상품 데이터를 불러오지 못했습니다.');
      }
    };

  useEffect(() => {
    fetchProducts();
  }, [customerId]);

  useEffect(() => {
    productsRef.current = products; // 최신 상태를 ref에 저장
  }, [products]);

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
    { headerName: '상품명', field: '상품명', editable: true },
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
    { headerName: '상품코드', field: '상품코드', editable: true },
    { field: 'id', hide: true }, // 숨겨진 id 필드 추가
  ];

  const [columnDefs, setColumnDefs] = useState(defaultColumns);
  const [rowData, setRowData] = useState([]);

  const handleAddRow = () => {
    const newRow = {
      주문일자: '',
      주문번호: '',
      상품명: '',
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

    // 변경 될 상품 수를 메시지에 표시
    const confirmAdd = window.confirm(`${newRows.length}개의 송장 내용을 등록 하시겠습니까?`);
    
    if (!confirmAdd) {
      return; // 취소 시 함수 종료
    }

    const invalidRows = newRows.filter((row, index) => !row.상품명);
    if (invalidRows.length > 0) {
      alert(`상품명은 필수 입력입니다. ${invalidRows.map((row) => rowData.indexOf(row) + 1).join(', ')} 행`);
      return;
    }

    const mappedData = newRows.map((row) => ({
      customerId: customerId, // 거래처 ID
      invoiceId: invoiceId,   // 송장 ID
      orderDate: row.주문일자,
      orderNumber: row.주문번호,
      productName: row.상품명,
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
      customerId: customerId, // 거래처 ID
      invoiceId: invoiceId,   // 송장 ID
      orderDate: row.주문일자,
      orderNumber: row.주문번호,
      productName: row.상품명,
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
        상품명: item.productName || "",
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

  const onCellValueChanged = (params) => {
    if (params.oldValue !== params.newValue) {
      const { colDef, data } = params;
  
      // 상품명 변경 시 상품코드 업데이트
      if (colDef.field === '상품명') {
        const matchedProduct = productsRef.current.find(
          (product) => product.invoiceName === params.newValue
        );
  
        if (matchedProduct) {
          data['상품코드'] = matchedProduct.productCode; // 상품코드 매핑
        } else {
          data['상품코드'] = ''; // 매칭되는 상품이 없으면 빈 값
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

        // 상품명과 상품코드 매핑
        const matchedProduct = productsRef.current.find(
          (product) => product.invoiceName === rowData['상품명']
        );
        console.log('Matched Product:', matchedProduct); // 디버깅용 로그
        if (matchedProduct) {
          rowData['상품코드'] = matchedProduct.productCode;
        }

        return rowData;
      });

      return [...prevRowData, ...newRowData];
    });
  };

  const handleDownloadProductCodes = () => {
    if (!products || products.length === 0) {
      alert("다운로드할 상품 데이터가 없습니다.");
      return;
    }
  
    // 1. 엑셀 데이터 생성
    const worksheetData = products.map((product) => ({
      "상품코드": product.productCode,
      "상품명": product.productName,
      "송장표기명": product.invoiceName,
      "정산시모델명": product.modelName,
    }));
  
    // 2. 워크시트 및 워크북 생성
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
  
    // 3. 엑셀 파일 다운로드
    const fileName = `상품코드_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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
  
        // rowData 생성 - 기본 컬럼에 해당하는 데이터만 매핑
        const newRowData = rows.map((row) => {
          const rowData = {};

          headers.forEach((header, index) => {
            let cellValue = row[index];
            
            // 주문일자 필드의 경우 날짜 형식 변환
            if (header === '주문일자' && typeof cellValue === 'number') {
              const date = XLSX.SSF.parse_date_code(cellValue); // 날짜 시리얼 값 변환
              const correctedDate = new Date(date.y, date.m - 1, date.d + 1); // 하루를 보정
              cellValue = correctedDate.toISOString().split('T')[0]; // yyyy-MM-dd
            }
            
            // 상품명과 상품코드 매핑
            const matchedProduct = products.find((product) => product.invoiceName === rowData['상품명']);
            rowData['상품코드'] = matchedProduct ? matchedProduct.productCode : '';

            rowData[header] = cellValue || ''; // 컬럼 이름과 매칭되는 데이터 매핑
          });

          rowData.isNew = true; // 새 데이터로 플래그 설정
          return rowData;
        });
  
        setRowData([...rowData, ...newRowData]); // 기존 데이터에 추가
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
        <button style={styles.button} onClick={handleDownloadTemplate}>엑셀 양식 다운로드</button>
        <button style={styles.button} onClick={handleDownloadProductCodes}>상품코드 다운로드</button>
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