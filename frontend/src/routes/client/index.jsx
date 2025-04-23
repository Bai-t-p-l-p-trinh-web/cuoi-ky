import Default from "../../Layout/Default";
import Home from "../../pages/Home";

export const routes = [
    {
        path: "/",
        element: <Default/>,
        children: [
            {
                index: true,
                element: <Home/>
            }
        ]
    }
]