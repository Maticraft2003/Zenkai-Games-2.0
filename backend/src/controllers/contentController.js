import {all,run} from "../../database.js";
const settings={
 comentarios:{table:"comentarios",columns:["contenido"],required:["contenido"]},
 noticias:{table:"noticias",columns:["titulo","contenido","imagen"],required:["titulo","contenido"]}
};
export function contentController(type){
 const c=settings[type];
 return {
  list:async(req,res,next)=>{try{res.json({success:true,[type]:await all(`SELECT * FROM ${c.table} ORDER BY id DESC`)});}catch(e){next(e);}},
  create:async(req,res,next)=>{try{
   for(const f of c.required)if(!String(req.body[f]??"").trim())return res.status(400).json({success:false,mensaje:`Falta ${f}.`});
   const vals=c.columns.map(f=>String(req.body[f]??"").trim()),marks=c.columns.map(()=>"?").join(",");
   const r=await run(`INSERT INTO ${c.table}(${c.columns.join(",")}) VALUES(${marks})`,vals);res.status(201).json({success:true,id:r.lastID});
  }catch(e){next(e);}},
  update:async(req,res,next)=>{try{
   for(const f of c.required)if(!String(req.body[f]??"").trim())return res.status(400).json({success:false,mensaje:`Falta ${f}.`});
   const vals=c.columns.map(f=>String(req.body[f]??"").trim()),set=c.columns.map(f=>`${f}=?`).join(",");
   const r=await run(`UPDATE ${c.table} SET ${set} WHERE id=?`,[...vals,req.params.id]);if(!r.changes)return res.status(404).json({success:false,mensaje:"Contenido no encontrado."});res.json({success:true});
  }catch(e){next(e);}},
  remove:async(req,res,next)=>{try{const r=await run(`DELETE FROM ${c.table} WHERE id=?`,[req.params.id]);if(!r.changes)return res.status(404).json({success:false,mensaje:"Contenido no encontrado."});res.json({success:true});}catch(e){next(e);}}
 };
}
