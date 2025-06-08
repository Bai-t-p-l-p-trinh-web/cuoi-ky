import { CiLogout } from "react-icons/ci";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function MyAccount () {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleLogout = () => {
        const loadingToastLogout = toast.loading('Đang đăng xuất ... ');

        const logoutUser = async() => {
            
            try {
                const userLogout = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/user/logout`,{

                },
                {
                    withCredentials : true
                });
                toast.update(loadingToastLogout, {
                    render: 'Đăng xuất thành công',
                    type : 'success',
                    isLoading : false,
                    autoClose : 3000
                });
                
                setTimeout(() => {
                    navigate('/');
                }, 3000);
                
            } catch(error) {
                toast.update(loadingToastLogout, {
                    render : error.response?.data?.message || 'Đăng xuất thất bại',
                    type : 'error',
                    isLoading : false,
                    autoClose : 3000
                });
            }
        };
        logoutUser();
        dispatch(logout());
        
    }

    return (
        <>  
            <div className="myAccount">
                <ToastContainer/>
                <button className="myAccount__logout" onClick={handleLogout}>
                    <CiLogout/>
                    <span className="myAccount__span">Đăng xuất</span>
                </button>
            </div>
        </>
    )
};
export default MyAccount;