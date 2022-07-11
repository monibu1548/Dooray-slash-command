import * as express from "express";
import { EndPoint } from "../../lib/contants";

const router = express.Router();

// 슬래시 커맨드 실행 시 호출되는 Router
router.post(EndPoint.Request, async (req: express.Request, res: express.Response) => {

});

// 유저의 상호작용 시 호출되는 Router
router.post(EndPoint.Interaction, async (req: express.Request, res: express.Response) => {

});