import Header from "../components/Header/Header";
import {Outlet} from "react-router-dom";
function Default(){
    return (
        <>
            <Header/>
        
            <main className="main">
                <Outlet/>
            </main>
        </>
    )
}
export default Default;