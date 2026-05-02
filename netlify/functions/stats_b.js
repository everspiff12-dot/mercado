const mercadopago = require('mercadopago');

mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN });

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method not allowed' };
    }
    
    try {
        const { items, payer, external_reference, back_urls } = JSON.parse(event.body);
        
        const preference = {
            items, payer, external_reference, back_urls,
            auto_return: 'approved',
            notification_url: `${process.env.URL}/.netlify/functions/webhook-mercado-pago`
        };
        
        const result = await mercadopago.preferences.create(preference);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                init_point: result.body.init_point,
                preferenceId: result.body.id
            })
        };
    } catch (error) {
        console.error('Erro MP:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};