import {get,run} from "../../database.js";
export async function rateGame(req,res,next){
  try{
    const score=Number(req.body.puntuacion),id=Number(req.params.gameId);
    if(!Number.isInteger(score)||score<1||score>5)return res.status(400).json({success:false,mensaje:"La valoración debe ser de 1 a 5 estrellas."});
    if(!await get("SELECT id FROM juegos WHERE id=?",[id]))return res.status(404).json({success:false,mensaje:"Juego no encontrado."});
    await run(`INSERT INTO valoraciones(usuario_id,juego_id,puntuacion) VALUES(?,?,?)
      ON CONFLICT(usuario_id,juego_id) DO UPDATE SET puntuacion=excluded.puntuacion,updated_at=CURRENT_TIMESTAMP`,[req.usuario.id,id,score]);
    const rating=await get("SELECT ROUND(AVG(puntuacion),2) promedio,COUNT(*) cantidad_votos FROM valoraciones WHERE juego_id=?",[id]);
    res.json({success:true,...rating,mensaje:"Tu valoración quedó guardada."});
  }catch(e){next(e);}
}
export async function getMyRating(req,res,next){
  try{const row=await get("SELECT puntuacion FROM valoraciones WHERE usuario_id=? AND juego_id=?",[req.usuario.id,req.params.gameId]);res.json({success:true,puntuacion:row?.puntuacion??null});}
  catch(e){next(e);}
}
