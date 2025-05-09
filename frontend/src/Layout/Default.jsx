import Header from "../components/Header/Header";
import {Outlet} from "react-router-dom";
import PageFooter from "../components/Page_Footer";
function Default(){
    return (
        <>
            <Header/>
            <main className="main">
                <Outlet/>
            </main>
            <PageFooter/>
        </>
    )
}
export default Default;