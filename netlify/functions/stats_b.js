const mercadopago = require('mercadopago');
const { createClient } = require('@supabase/supabase-js'); // O cliente Supabase é mantido para outras funções, como o webhook.

mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN });
// Inicializa o Supabase para buscar a chave do afiliado
// O cliente Supabase é mantido para outras funções, como o webhook, mas não será usado para tokens MP aqui.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); 

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method not allowed' };
    }
    
    try {
        mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN });

        const { items, payer, external_reference, back_urls } = JSON.parse(event.body);
        
        // ✅ Garante que a URL seja absoluta. No Netlify, process.env.URL é a URL do seu site.
        const siteUrl = process.env.URL || 'https://seu-site.netlify.app';

        const preference = {
            items, payer, external_reference, back_urls,
            auto_return: 'approved',
            notification_url: `${siteUrl}/.netlify/functions/webhook-mercado-pago`
        };
        
        const result = await mercadopago.preferences.create(preference);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                init_point: result.body.init_point,
                sandbox_init_point: result.body.sandbox_init_point, // ✅ Retorna o link de teste explicitamente
                preferenceId: result.body.id
            })
        };
    } catch (error) {
        console.error('Erro MP:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};