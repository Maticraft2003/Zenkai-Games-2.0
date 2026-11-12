import {useState} from "react";
import {AuthContext} from "./useAuth";
const KEY="zenkai_session";
function readSession(){try{return JSON.parse(localStorage.getItem(KEY)||"null");}catch{return null;}}
export function getToken(){return readSession()?.token||"";}
function AuthProvider({children}){
 const [session,setSession]=useState(readSession);
 const login=(data)=>{const value={token:data.token,usuario:data.usuario};localStorage.setItem(KEY,JSON.stringify(value));setSession(value);};
 const logout=()=>{localStorage.removeItem(KEY);setSession(null);};
 return <AuthContext.Provider value={{usuario:session?.usuario||null,token:session?.token||"",login,logout}}>{children}</AuthContext.Provider>;
}
export default AuthProvider;
