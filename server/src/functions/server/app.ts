import Router from '@koa/router';
import Koa from 'koa';
import cors from '@koa/cors';
import { bodyParser } from '@koa/bodyparser';
import axios from 'axios';

const router = new Router()
  .get('/', (ctx) => {
    ctx.body = 'OK';
  })
  .post('/property', async (ctx) => {

    const {
      stateCode,
      suburb,
      postCode,
      streetName,
      streetType,
      unitNumber,
      streetNumber
    } = ctx.request.body;

    const response = await axios({
      method: 'post',
      url: `https://www.onthehouse.com.au/odin/api/compositeSearch`,
      data: {
        size: 24,
        number: 0,
        sort: null,
        query: {
          queries: [
            {
              category: 'Property',
              isForSale: false,
              isForRent: false,
              stateCode,
              suburb,
              postCode,
              streetName,
              streetType,
              unitNumber,
              streetNumber
            }
          ]
        }
      }
    });

    const reponseData = response.data["content"][0]

    ctx.body = {
      beds: reponseData["beds"],
      baths: reponseData["baths"],
      carSpaces: reponseData["carSpaces"],
      landSizeUnit: reponseData["landSizeUnit"],
      guesstimate: reponseData["guesstimate"],
      links: reponseData["links"],
    }
  });

const createApp = () => {
  const app = new Koa();
  app.use(cors());
  app.use(bodyParser());
  app.use(router.routes()).use(router.allowedMethods());

  return app;
};

export { createApp };
