import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { get, run } from "../../database.js";

export async function register(req,res,next) {
  try {
    const {username,email,password}=req.body;
    if (!username?.trim() || !email?.trim() || !password || password.length<8)
      return res.status(400).json({success:false,mensaje:"Completá los campos. La contraseña debe tener al menos 8 caracteres."});
    const normalized=email.trim().toLowerCase(), hash=await bcrypt.hash(password,12);
    const result=await run("INSERT INTO usuarios(username,email,password,role) VALUES(?,?,?,'user')",[username.trim(),normalized,hash]);
    res.status(201).json({success:true,mensaje:"Cuenta creada.",usuario:{id:result.lastID,username:username.trim(),email:normalized,role:"user"}});
  } catch(e) { if(e.code==="SQLITE_CONSTRAINT") return res.status(409).json({success:false,mensaje:"Ese correo ya está registrado."}); next(e); }
}
export async function login(req,res,next) {
  try {
    const {email,password}=req.body;
    if(!email?.trim()||!password) return res.status(400).json({success:false,mensaje:"Ingresá correo y contraseña."});
    const user=await get("SELECT id,username,email,password,role FROM usuarios WHERE lower(email)=?",[email.trim().toLowerCase()]);
    if(!user) return res.status(401).json({success:false,mensaje:"Correo o contraseña incorrectos."});
    let valid=user.password.startsWith("$2") ? await bcrypt.compare(password,user.password) : user.password===password;
    if(!valid) return res.status(401).json({success:false,mensaje:"Correo o contraseña incorrectos."});
    if(!user.password.startsWith("$2")) {
      const hash=await bcrypt.hash(password,12); await run("UPDATE usuarios SET password=? WHERE id=?",[hash,user.id]);
    }
    const token=jwt.sign({sub:user.id},process.env.JWT_SECRET,{expiresIn:"8h"});
    res.json({success:true,token,usuario:{id:user.id,username:user.username,email:user.email,role:user.role}});
  } catch(e){next(e);}
}
export function me(req,res){res.json({success:true,usuario:req.usuario});}
