/**
 * qr controller
 */

 import QRCode  from 'qrcode'
 import shortid from 'shortid';
import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::qr.qr', ({ strapi }) =>  ({ 
    async generate(ctx) {
        
        // Validate parameters
        const { item_id, type } = ctx.request.body;
        if(!item_id || !type) return ctx.badRequest('ItemId or Type is missing', [{ messages: [{ message: 'Item id or Type is missing' }] }]);

        // Validate Type exists
        const itemType = getItemType(type);        
        if (itemType === 'UNKNOWN') return ctx.badRequest('Item type is unknown', [{ messages: [{ message: 'Item type is unknown' }] }]);
        
        // Validate Item exists
        const api_item = `api::${itemType}.${itemType}`;
        const item = await strapi.query(api_item).findOne({ id: item_id });
        if (!item) return ctx.badRequest('Item not found', [{ messages: [{ message: 'Item not found' }] }]);

        // Validate QR not exists
        const exist_qr = await strapi.db.query('api::qr.qr').findOne({ where: {type, item_id} })        
        if (exist_qr) return ctx.badRequest('Item already have a QR', [{ messages: [{ message: 'Item already have a QR' }] }]);
        
        // Generate QR
        const url_id = shortid.generate();
        const short_url = getShortUrl(url_id);
        const qr_image_url = await generateQR(short_url)        
        const new_qr = {
            item_id,
            type,
            url_id,
            short_url: short_url,
            long_url: getLongUrl(type, item_id),
            qr_image_url: qr_image_url
        }

        const currentQrModel = await strapi.service('api::qr.qr').create({ data: new_qr });
        return { data: { ...currentQrModel }}
    },

    async resolveQr(ctx){
         // Validate parameters url_id
        const { url_id } = ctx.request.params;
        if(!url_id) return ctx.badRequest('Invalid Url', [{ messages: [{ message: 'Invalid Url' }] }]);

        // Validate url_id exists
        const exist_qr = await strapi.db.query('api::qr.qr').findOne({ where: {url_id} })
        if (!exist_qr) return ctx.badRequest('Invalid Url', [{ messages:  [{ message: 'Invalid Url'}] }]);

        //todo, redirect to the page...
        return exist_qr
    }
}));

const getItemType = (type:number) => {       
    switch(type) {
        case 1:
            return 'product';
        case 2:
            return 'survey';
        default:
            return 'UNKNOWN';
    }            
}

const getLongUrl = (type:number, item_id:number) => {
    let url = 'http://localhost/api'; // TODO ENV
    switch(type) {
        case 1:
            return  `${url}/product/${item_id}`;
        case 2:
            return `${url}/survey/public/${item_id}`;
        default:
            return `${url}`;
    }    
}

const getShortUrl = (url_id:string) => {
    // TODO ENV
    return`http://localhost/api/qrre/${url_id}`;
}

const generateQR = async (text:string) => {
    try {
      return await QRCode.toDataURL(text)
    } catch (err) {
      console.error(err)
    }
  }
  