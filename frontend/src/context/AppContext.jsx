import { createContext } from "react";
import { drivers } from "../assets/assets";

export const AppContext = createContext()

const AppContextProvider = (props) => {
    const currencySymbol = '$'
    
    const value = {
 drivers,currencySymbol
    }
    return ( 
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
export default AppContextProvider