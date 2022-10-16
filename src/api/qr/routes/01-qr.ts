
module.exports = {
    routes: [
        { // Path defined with an URL parameter
            method: 'POST',
            path: '/qr/generate', 
            handler: 'qr.generate',
            config: {
                auth: false
            }
        },{
            method: 'GET',
            path: '/qrre/:url_id', 
            handler: 'qr.resolveQr',
            config: {
                auth: false
            }
        }
    ]
  }