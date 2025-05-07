import { useRoutes } from "react-router-dom";
import "../../routes/client";
import { routes } from "../../routes/client";
import { routesAdmin } from "../../routes/admin"

function AllRoutes(){
    const elementRoutes = [...routes,...routesAdmin]
    const elements = useRoutes(elementRoutes);
    return <>
        {elements}
    </>
}
export default AllRoutes;