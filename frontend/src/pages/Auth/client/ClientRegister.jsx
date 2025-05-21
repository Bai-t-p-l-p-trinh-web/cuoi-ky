import { useState } from "react";
import { Link } from "react-router-dom";
import "./scss/ClientRegister.scss";
function ClientRegister(){
    const [registerData, setRegisterData] = useState({
        name: "",
        email: "",
        password: "",
        rePassword: ""
    });

    const handleChangeValue = (e) => {
        const {name, value} = e.target;
        
        setRegisterData((prev) => (
            {
                ...prev,
                [name] : value
            }
        ));
    }

    return (
        <>
            <div className="register">
                <div className="register__box">
                    <div className="register__contain">
                        <h3 className="register__title">Create an Account</h3>
                        <p className="register__introduction">Join now to streamline your experience from day one</p>
                        <form className="register__form">
                            <label className="register__form__name-label" htmlFor="registerName">Họ và tên</label>
                            <input 
                                type="text" 
                                name="name" 
                                className="register__form__name-input" 
                                placeholder="Họ và tên" 
                                id="registerName" 
                                onChange={handleChangeValue} 
                                value={registerData.name}
                            />
                            <label className="register__form__email-label" htmlFor="registerEmail">Email</label>
                            <input 
                                type="email" 
                                name="email" 
                                className="register__form__email-input" 
                                placeholder="Email" 
                                id="registerEmail" 
                                onChange={handleChangeValue} 
                                value={registerData.email}
                            />
                            <label className="register__form__password-label" htmlFor="registerPassword">Password</label>
                            <input 
                                type="password" 
                                name="password" 
                                className="register__form__password-input" 
                                placeholder="Password" 
                                id="registerPassword" 
                                onChange={handleChangeValue} 
                                value={registerData.password}
                            />
                            <label className="register__form__Repassword-label" htmlFor="registerRePassword">Confirm Password</label>
                            <input 
                                type="password" 
                                name="rePassword" 
                                className="register__form__Repassword-input" 
                                placeholder="Confirm Password" 
                                id="registerRePassword" 
                                onChange={handleChangeValue} 
                                autocomplete="new-password"
                                value={registerData.rePassword}
                            />
                            <button className="register__form__submit">Register</button>
                        </form>
                        <div className="register__or">
                            <span className="register__or-horizontal"></span>
                            <span className="register__or-span">Or Register With</span>
                            <span className="register__or-horizontal"></span>
                        </div>
                        <div className="register__google">
                            Google
                        </div>
                        <p className="register__login">
                            Already Have An Account?
                            <Link to="/login">Log in</Link>
                        </p>
                    </div>
                    <div className="register__img">
                        <img className="register__img-img" src="/register.jpg" alt="register"/>
                    </div>
                </div>
            </div>
        </>
    )
};
export default ClientRegister;