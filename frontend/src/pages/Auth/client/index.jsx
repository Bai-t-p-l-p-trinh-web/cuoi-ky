import { useState, useEffect } from "react";
import {Link, useNavigate} from "react-router-dom";
import "./scss/ClientLogin.scss";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { useFetchUserInfo } from "../../../hooks/useFetchUserInfo";
function ClientAuth(){
    const { user, loading, error } = useFetchUserInfo();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [dataClientLogin, setDataClientLogin] = useState({
        email: "",
        password: ""
    });

    const handleChangeValue = (e) => {
        const {name, value} = e.target;
        
        setDataClientLogin((prev) => (
            {
                ...prev,
                [name] : value
            }
        ));
    }

    const ToggleShowPassword = () => {
        setShowPassword(prev => !prev);
    }

    const getGoogleLink = () => {
        const { VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_AUTHORIZED_REDIRECT_URI } = import.meta.env;
        const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const options = {
            redirect_uri : VITE_GOOGLE_AUTHORIZED_REDIRECT_URI,
            client_id : VITE_GOOGLE_CLIENT_ID,
            access_type : 'offline',
            response_type : 'code',
            scope : [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'
            ].join(' ')
        };
        
        const qs = new URLSearchParams(options);
        return `${rootUrl}?${qs.toString()}`;
        
    }

    useEffect (() => {
        if(user) {
            toast.error('Người dùng đã đăng nhập rồi');
            setTimeout(() => {
                navigate('/');
            }, 3000);
        }
    }, [user]);
    return (
        <>
            <div className="clientAuth">
                <ToastContainer/>
                <div className="clientAuth__contain">
                    <h3 className="clientAuth__title">
                        Login in to ? 
                    </h3>
                    <p className="clientAuth__create">
                        New here? 
                        <Link to="/register">Create an account</Link>
                    </p>
                    <form className="clientAuth__form">
                        <label className="clientAuth__form__email-label" htmlFor="clientLoginEmail">Email</label>
                        <input className="clientAuth__form__email-input" type="email" id="clientLoginEmail" name="email" value={dataClientLogin.email} onChange={handleChangeValue} placeholder="Email address"/>
                        <label className="clientAuth__form__password-label" htmlFor="clientLoginPassword">Password</label>
                        <div className="clientAuth__form__password-contain">
                            <input className="clientAuth__form__password-input" type={showPassword ? "text" : "password"} id="clientLoginPassword" name="password" value={dataClientLogin.password} onChange={handleChangeValue} placeholder="Password" />
                            <button type="button" className="clientAuth__form__password-toggle" onClick={ToggleShowPassword}>
                            {
                                showPassword ? 
                                <FaEyeSlash className="clientAuth__form__password-icon"/>
                                :
                                <FaEye className="clientAuth__form__password-icon"/>
                            }
                            </button>
                            {/* <Link to="/forget-password" className="clientAuth__form__password-forget">Forgot password?</Link> */}
                        </div>
                        <button className="clientAuth__form__submit">Sign in</button>
                    </form>
                    <div className="clientAuth__or">
                        <span className="clientAuth__or__horizontal"></span>
                        <span className="clientAuth__or__span">OR</span>
                        <span className="clientAuth__or__horizontal"></span>
                    </div>
                    <div className="clientAuth__google">
                        <Link to={getGoogleLink()}>
                            <img src="/google.png" alt="Google" className="clientAuth__google__img"/>
                            <span className="clientAuth__google__span">Continue with Google</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
};
export default ClientAuth;