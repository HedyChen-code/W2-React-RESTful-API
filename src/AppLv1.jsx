import { useState } from 'react';
import axios from 'axios';
import './assets/style.css';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function AppLv1() {
  const [ formData, setFormData ] = useState({
    username: '',
    password: ''
  });

  // 是否登入，預設未登入
  const [ isAuth, setIsAuth ] = useState(false);
  // 產品列表
  const [ products, setProducts ] = useState([]);
  // 目前選中的產品
  const [ tempProduct, setTempProducts ] = useState(null);

  // 驗證是否登入
  const checkLogin = async () =>  {
    try {
      // 從 cookie 中提取 token
      const token = document.cookie
        .split(";")
        .find((row) => row.startsWith("jiaToken"))
        ?.split("=")[1];
        console.log("目前 Token：", token);

        if (token) {
          // 預設登入
          axios.defaults.headers.common.Authorization = token;

          const res = await axios.post(`${API_BASE}/api/user/check`);
          console.log("Token 驗證結果：", res.data);
        }
        
    } catch (error) {
      console.error("Token 驗證失敗：", error.resonse?.data);
    }
  }

  const getData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(response.data.products);
    } catch (error) {
      console.error(error.response.data.message);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // 預設保留前一次輸入的值，而不用每次登入都要從頭開始輸入帳號/密碼
    setFormData((prevData) => ({ // 回傳物件 -> 外層需包裹 () 以作區別
      ...prevData,  
      [name]: value,
    }));
  };
  
  // 登入提交處理 -> 當觸發 submit 時執行的 code
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // post 帳號/密碼
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      // 取得 token, 到期日
      const { token, expired } = response.data;
      // 將 token, expired 存取到 cookie 中
      document.cookie = `jiaToken=${token};expires=${new Date(expired)};`;

      // 設定 axios 預設 header
      axios.defaults.headers.common.Authorization = `${token}`;

      getData();
      
      // 將登入狀態改為已登入
      setIsAuth(true);
    } catch (error) {
      alert('登入失敗：' + error.response.data.message);
    }
  }

  return (
    <>
      {/* isAuth ? (已登入) : (未登入); */}
      {/* !isAuth ? (未登入) : (已登入); */}
      {!isAuth ? (
        // 未登入 -> 顯示登入頁
        <div className="container login">
          <div className="row justify-content-center">
            <h1 className="h2 mb-3 font-weight-normal">請先登入</h1>
            <div className="col-8">
              <form id="form" className="form-signin" onSubmit={ handleSubmit }>
                <div className="form-floating mb-3">
                  <input 
                    type="email"
                    className="form-control"
                    id="username"
                    name="username"
                    placeholder="name@example.com"
                    value={ formData.username }
                    onChange={ handleInputChange }
                    required
                    autoFocus
                  />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    placeholder="Password"
                    value={ formData.password }
                    onChange= { handleInputChange }
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <button 
                  className="btn btn-lg btn-primary w-100 mt-3"
                  type="submit">登入</button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        // 已登入 -> 顯示後台產品管理頁
        <div className="container">
          <div className="row mt-5">
            <div className="col-md-6">
              <button 
                type="button" 
                className="btn btn-danger mb-5" 
                id="check"
                onClick={ checkLogin }
                >
                  確認是否登入
                </button>
                <h2>產品列表</h2>
                <table className="table">
                  <thead>
                    <tr>
                      <th>產品名稱</th>
                      <th>原價</th>
                      <th>售價</th>
                      <th>是否啟用</th>
                      <th>查看細節</th>
                    </tr>
                  </thead>
                  <tbody>
                    { products && products.length > 0 ? (
                      products.map( product => (
                        <tr key={ product.id }>
                          <td>{ product.title }</td>
                          <td>{ product.origin_price }</td>
                          <td>{ product.price }</td>
                          <td>{ product.is_enable ? "啟用" : "未啟用" }</td>
                          <td>
                            <button 
                              type="button"
                              className="btn btn-primary"
                              onClick={ () => setTempProducts(product) }
                              >
                                查看細節
                              </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5">尚無產品資料</td>
                      </tr>
                    ) }
                  </tbody>
                </table>
            </div>
            <div className="col-md-6">
              <h2>單一產品細節</h2>
              { tempProduct ? (
                <div className="card mb-3">
                  <img 
                    src={ tempProduct.imageUrl } 
                    className="card-img-top primary-image"
                    alt="主圖" />
                    <div className="card-body">
                      <h5 className="card-title">
                        { tempProduct.title }
                        <span className="badge bg-primary ms-2">
                          { tempProduct.category }
                        </span>
                      </h5>
                      <p className="card-text">商品描述：{tempProduct.description}</p>
                      <p className="card-text">商品內容：{tempProduct.content}</p>
                      <div className="d-flex">
                        <p className="card-text text-secondary">
                          <del>{ tempProduct.origin_price }</del>
                          元 / { tempProduct.price } 元
                        </p>
                      </div>
                      <h5 className="mt-3">更多圖片：</h5>
                      <div className="d-flex flex-wrap">
                        {/* ?. -> 可選鏈 -> 存在而且不是 null/undefined，才去呼叫 .map()，否則回傳 undefined */}
                        {/* 大概同 tempProduct.imagesUrl ? tempProduct.imagesUrl.map : null  */}
                        { tempProduct.imagesUrl ?.map((url, index) => (
                          <img
                            key={ index }
                            src={ url }
                            className="images"
                            alt="副圖" 
                          />
                        )) }
                      </div>
                    </div>
                </div>
              ) : (
                <p className="text-secondary">請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AppLv1
