import { Router } from 'express';

import s3Upload from '../middlewares/awsS3Upload';
import SendVideoService from '../services/SendVideoService';
import WatchVideoService from '../services/WatchVideoService';
import SubscriptionService from '../services/SubscriptionService';

const videosRouter = Router();

// O vídeo é enviado no middleware dentro da requisição
// Dentro do objeto passado, de passar parametros (aws;ts)
videosRouter.post('/send', s3Upload({}).single('file'), async (req, res) => {
	try {
		const { title, description } = req.body;
		if (req.headers.authorization) {
			const token = req.headers.authorization;

			// O middleware do S3 usa Multer que retorna objeto com infos do vídeo
			const { file } = req;

			const file_location = (file as any).location;

			const sendVideo = new SendVideoService();


			const sent = await sendVideo.execute({ token, file_location, title, description });

			if (sent) {
				return res.status(200).json({ status: 1 });
			}
		} else {
			throw new Error("Token não recebido.")
		}
	} catch (err) {
		res.status(400).json({ status: 0, errorName: err, errorMessage: err.message });
	}

});


videosRouter.get('/watch', async (req, res) => {
	// watch?v=DQMWPDM1P2M&t=20s
	try {
		const video_id = req.query.v, video_time = req.query.t;

		if (typeof (video_id) !== 'string') {
			throw new Error("id do vídeo deve ser uma string.")
		}

		if (req.headers.authorization && video_id) {
			const [, token] = req.headers.authorization.split(" ");


			const watchVideo = new WatchVideoService();

			const videoData = await watchVideo.execute({ token, video_id });

			res.status(200).json(videoData)
		} else {
			throw new Error("Token não recebido.")
		}

	} catch (err) {
		console.log(err);

	}
});

videosRouter.post('/subs', async (req, res) => {
	// watch?v=DQMWPDM1P2M&t=20s
	try {
		const target_id = req.query.owner_id;

		if (typeof (target_id) !== 'string') {
			throw new Error("id do usuario deve ser uma string.")
		}

		if (req.headers.authorization && target_id) {
			const [, token] = req.headers.authorization.split(" ");//tenho q entender isso aki e o if


			const Subs = new SubscriptionService();

			const statusSubs = await Subs.execute({ token, target_id });

			res.status(200).json(statusSubs);
		} else {
			throw new Error("Token não recebido.")
		}

	} catch (err) {
		console.log(err);

	}
});


export default videosRouter;
