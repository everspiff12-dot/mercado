// Exemplo para Netlify Functions ou Vercel
const { createClient } = require('@supabase/supabase-js');
const mercadopago = require('mercadopago');

mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ Service role apenas no backend!
);

exports.handler = async (event) => {
    try {
        const { type, data } = JSON.parse(event.body);
        
        // ✅ Apenas processar notificações de pagamento
        if (type === 'payment' && data?.id) {
            const payment = await mercadopago.payment.get(data.id);
            const { status, external_reference, transaction_amount } = payment.body;
            
            if (status === 'approved' && external_reference) {
                // ✅ Atualizar afiliado para ATIVO
                const { error } = await supabase
                    .from('afiliados')
                    .update({
                        ativo: true,
                        status_pagamento: 'pago',
                        data_pagamento: new Date().toISOString(),
                        id_transacao_mercadopago: data.id.toString()
                    })
                    .eq('id', external_reference); // ✅ Removido parseInt pois o ID é UUID
                
                if (error) throw error;
                
                console.log(`✅ Pagamento confirmado: afiliado ${external_reference} ativado`);
                
                // ✅ Opcional: Enviar e-mail de boas-vindas
                // await sendWelcomeEmail(external_reference);
            }
        }
        
        return { statusCode: 200, body: 'OK' };
        
    } catch (error) {
        console.error('❌ Erro no webhook:', error);
        return { statusCode: 500, body: 'Error' };
    }
};