import { useState } from 'react';
import axios from 'axios';
import "./sass/all.scss"

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;



function AppLv3 () {
  const [ formData, setFormData ] = useState({
    username: "",
    password: ""
  });

  const [ isAuth, setIsAuth ] = useState(false);
  const [ products, setProducts ] = useState([]);
  const [ tempProduct, setTempProducts ] = useState(null); // null -> 空值

  const logout = async () => {
    try {
      const response = await axios.post(`${API_BASE}/logout`);
      setIsAuth(false);
    } catch (error) {
      console.log(error)
      alert('登出失敗：' + error?.response?.data?.message || error.message);
    }
    
  }
  
  const checkLogin = async () => {
    try {
      // var myCookie = document.cookie.replace(
        // /(?:(?:^|.*;\s*)test2\s*\=\s*([^;]*).*$)|^.*$/,
        // "$1",);
      const token = document.cookie.replace(
        /(?:(?:^|.*;\s*)jiaToken\s*\=\s*([^;]*).*$)|^.*$/,
        "$1",);
      console.log('目前 Token：', token);

      if (token) {
        axios.defaults.headers.common.Authorization = token;

        const response = await axios.post(`${API_BASE}/api/user/check`);
        console.log('Token 驗證結果：', response.data);
      }
    } catch (error) {
      console.error('Token 驗證失敗：', error.response?.data);
    }
  }
  
  const getData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`)
    setProducts(response.data.products);
    } catch (error) {
      console.error(error?.response?.data?.message);
    }
    
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { expired, token } = response.data;
      // MDN: document.cookie = "someCookieName=true; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
      document.cookie = `jiaToken=${token}; expires=${new Date(expired)};`;
      axios.defaults.headers.common.Authorization = token;

      getData();
      setIsAuth(true);

    } catch (error) {
      alert('登入失敗：' + error?.response?.data?.message);
    }
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // React 自動傳入當前 state 值 setState((當前狀態) => (新狀態))
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }

  return (
    <>
      {!isAuth ? (
        // 未登入 -> 顯示登入頁
        <div className="container text-center min-vh-100">
          <div className="row login d-flex flex-column justify-content-center align-items-center 100vh">
            <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
            <div className="col-md-8">
              <form id="form" 
                className="w-100 mx-auto p-3 col-md-6 col-lg-4"
                style={{ maxWidth: "350px" }}
                onSubmit={ handleSubmit }
                >
                <div className="form-floating mb-3">
                  <input 
                    type="email"
                    className="form-control"
                    id="username"
                    name="username"
                    placeholder="test@example.com"
                    value={ formData.username }
                    onChange={ handleInputChange }
                    required
                    autoFocus />
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
                    onChange={ handleInputChange }
                    required />
                  <label htmlFor="password">Password</label>
                </div>
                <button type="submit" className="btn btn-primary w-100 mt-3">登入</button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        // 已登入 -> 顯示後台產品列表頁
        <div className="container text-center min-vh-100">
          <div className="row mt-5">
            <div className="col-md-6">
              <div className="d-flex justify-content-between px-4">
                <button 
                  type="button"
                  className="btn btn-danger mb-3"
                  id="check"
                  onClick={ checkLogin }
                >
                  確認是否登入
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary mb-3"
                  id="logout"
                  onClick={ logout }
                >
                  登出
                </button>
              </div>
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
                      <tr key={product.id}>
                        <td>{ product.title }</td>
                        <td>{ product.origin_price }</td>
                        <td>{ product.price }</td>
                        <td>{ product.is_enable ? "啟用" : "未啟用" }</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={ () => setTempProducts(product) }
                          >查看細節
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
                    className="card-img-top object-fit-contain w-100" 
                    style={{height: "300px"}}
                    alt="主圖" />
                  <div className="card-body">
                    <h5 className="card-title">
                      { tempProduct.title }
                      <span className="badge bg-primary ms-2">
                        { tempProduct.category }
                      </span>
                    </h5>
                    <p className="card-text text-secondary">商品描述：{ tempProduct.description }</p>
                    <p className="card-text text-secondary">商品內容：{ tempProduct.content }</p>
                    <p className="card-text text-secondary">
                      商品價格：<span><del>{tempProduct.origin_price}</del>元 / </span>
                      { tempProduct.price } 元
                    </p>
                    <h5 className="h6">更多圖片：</h5>
                    <div className="d-flex flex-wrap gap-2">
                      { tempProduct.imagesUrl ?.map((url, index) => {
                        <img 
                          key={ index }
                          src={ url}
                          alt="副圖"
                          style={{height: "150px", objectFit: "cover"}}
                        />
                      })}
                    </div>
                  </div>
                </div>
               ) : (
                <p className="text-secondary mt-4">請選擇一個商品查看</p>
              ) }
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AppLv3