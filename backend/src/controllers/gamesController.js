import {all,get,run} from "../../database.js";
import {validateCatalogGame} from "../services/catalogService.js";
const fields=["nombre","genero","etiqueta","plataforma","jugadores","imagen","descripcion"];
function validate(body){
  for(const f of ["nombre","genero","plataforma","jugadores","descripcion"]) if(!String(body[f]??"").trim()){
    const e=new Error(`El campo ${f} es obligatorio.`);e.status=400;throw e;
  }
  if(!Number.isInteger(Number(body.rawg_id))||Number(body.rawg_id)<=0){const e=new Error("Seleccioná el juego desde los resultados del catálogo.");e.status=400;throw e;}
}
export async function listGames(req,res,next){
  try{
    const juegos=await all(`SELECT j.id,j.nombre,j.genero,j.etiqueta,j.plataforma,j.jugadores,j.imagen,j.descripcion,j.rawg_id,
      ROUND(COALESCE(AVG(v.puntuacion),0),2) promedio,COUNT(v.id) cantidad_votos
      FROM juegos j LEFT JOIN valoraciones v ON v.juego_id=j.id GROUP BY j.id ORDER BY j.nombre COLLATE NOCASE`);
    res.json({success:true,juegos});
  }catch(e){next(e);}
}
export async function createGame(req,res,next){
  try{
    validate(req.body);const d=req.body,c=await validateCatalogGame(d.rawg_id,d.nombre);
    const values=fields.map(f=>f==="imagen"?(d.imagen||c.imagen):String(d[f]??"").trim());
    const r=await run("INSERT INTO juegos(nombre,genero,etiqueta,plataforma,jugadores,imagen,descripcion,rawg_id) VALUES(?,?,?,?,?,?,?,?)",[...values,Number(d.rawg_id)]);
    res.status(201).json({success:true,id:r.lastID,mensaje:"Juego agregado."});
  }catch(e){next(e);}
}
export async function updateGame(req,res,next){
  try{
    validate(req.body);const d=req.body,found=await get("SELECT id FROM juegos WHERE id=?",[req.params.id]);
    if(!found)return res.status(404).json({success:false,mensaje:"Juego no encontrado."});
    const c=await validateCatalogGame(d.rawg_id,d.nombre),values=fields.map(f=>f==="imagen"?(d.imagen||c.imagen):String(d[f]??"").trim());
    await run("UPDATE juegos SET nombre=?,genero=?,etiqueta=?,plataforma=?,jugadores=?,imagen=?,descripcion=?,rawg_id=? WHERE id=?",[...values,Number(d.rawg_id),req.params.id]);
    res.json({success:true,mensaje:"Juego actualizado."});
  }catch(e){next(e);}
}
export async function deleteGame(req,res,next){
  try{const r=await run("DELETE FROM juegos WHERE id=?",[req.params.id]);if(!r.changes)return res.status(404).json({success:false,mensaje:"Juego no encontrado."});res.json({success:true,mensaje:"Juego eliminado."});}
  catch(e){next(e);}
}
