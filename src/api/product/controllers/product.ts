/**
 * product controller
 */

import QRCode  from 'qrcode'
import shortid from 'shortid';
import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::product.product', ({ strapi }) =>  ({
  
    
  async create(ctx) {

    const product = await super.create(ctx);

    const qr_image_url = await generateQR("youtube.com")
    const short_url = shortid.generate()
    const qr = {
      id_item: product.data.id,
      type: 1,     
      short_url: short_url,
      long_url: "example/api/response.data.id",
      qr_image_url: qr_image_url
    }
    const currentQrModel = await strapi.service('api::qr.qr').create({ data: qr });      

    product.data = {
      ...product.data,
      qr: { data: { ...currentQrModel }}
    }
    
    return product 
  }
    
}));

const generateQR = async (text:string) => {
  try {
    return await QRCode.toDataURL(text)
  } catch (err) {
    console.error(err)
  }
}

