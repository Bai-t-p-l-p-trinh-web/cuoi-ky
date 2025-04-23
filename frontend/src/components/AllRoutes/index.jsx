import { useRoutes } from "react-router-dom";
import "../../routes/client";
import { routes } from "../../routes/client";

function AllRoutes(){
    const elements = useRoutes(routes);
    return <>
        {elements}
    </>
}
export default AllRoutes;