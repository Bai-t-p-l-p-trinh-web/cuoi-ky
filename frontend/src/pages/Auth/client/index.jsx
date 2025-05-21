import { useState } from "react";
import {Link} from "react-router-dom";
import "./scss/ClientLogin.scss";
import { FaEye, FaEyeSlash } from "react-icons/fa";
function ClientAuth(){
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
    return (
        <>
            <div className="clientAuth">
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
                        Sign in with Google
                    </div>
                </div>
            </div>
        </>
    )
};
export default ClientAuth;