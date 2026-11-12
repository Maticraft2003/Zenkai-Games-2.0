import {Router} from "express";
import {login,register,me} from "../controllers/authController.js";
import {createGame,deleteGame,listGames,updateGame} from "../controllers/gamesController.js";
import {getMyRating,rateGame} from "../controllers/ratingsController.js";
import {contentController} from "../controllers/contentController.js";
import {authenticate} from "../middleware/auth.js";
import {requireAdmin} from "../middleware/requireAdmin.js";
import {searchGames} from "../services/catalogService.js";
const router=Router();
router.post("/auth/register",register);router.post("/auth/login",login);router.get("/auth/me",authenticate,me);
router.get("/catalog/games",async(req,res,next)=>{try{const q=String(req.query.search||"").trim();if(q.length<2)return res.json({success:true,resultados:[]});res.json({success:true,resultados:await searchGames(q)});}catch(e){next(e);}});
router.get("/games",listGames);router.post("/games",authenticate,requireAdmin,createGame);router.put("/games/:id",authenticate,requireAdmin,updateGame);router.delete("/games/:id",authenticate,requireAdmin,deleteGame);
router.post("/games/:gameId/ratings",authenticate,rateGame);router.get("/games/:gameId/my-rating",authenticate,getMyRating);
for(const type of ["comentarios","noticias"]){const c=contentController(type);router.get(`/${type}`,c.list);router.post(`/${type}`,authenticate,requireAdmin,c.create);router.put(`/${type}/:id`,authenticate,requireAdmin,c.update);router.delete(`/${type}/:id`,authenticate,requireAdmin,c.remove);}
export default router;
