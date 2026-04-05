import emailjs from '@emailjs/browser';

// Credenciais emailJS (via variáveis de ambiente)
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

// IDs dos templates
const TEMPLATE_LGBT_SIGNUP = import.meta.env.VITE_EMAILJS_TEMPLATE_LGBT || '';
const TEMPLATE_CONTACT_MESSAGE = import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACT || '';

// Validar credenciais
if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY) {
  console.warn('⚠️ Credenciais emailJS não configuradas. Por favor, adicione as variáveis de ambiente VITE_EMAILJS_SERVICE_ID e VITE_EMAILJS_PUBLIC_KEY');
}

// Inicializar emailJS
if (EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

interface EmailParams {
  [key: string]: string | string[];
}

/**
 * Enviar email genérico
 */
const sendEmail = async (templateId: string, params: EmailParams): Promise<boolean> => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY || !templateId) {
    throw new Error('Credenciais emailJS não configuradas. Verifique as variáveis de ambiente.');
  }

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      templateId,
      params as Record<string, unknown>,
      EMAILJS_PUBLIC_KEY
    );
    return response.status === 200;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
};

/**
 * Enviar email de cadastro LGBT+
 */
export const sendLGBTSignupEmail = async (data: {
  nome: string;
  email: string;
  whatsapp?: string;
  identidadeGenero: string;
  orientacao: string;
  generoBusca: string[];
  estado: string;
  cidade: string;
}): Promise<boolean> => {
  const params: EmailParams = {
    to_email: data.email,
    to_name: data.nome,
    nome: data.nome,
    email: data.email,
    whatsapp: data.whatsapp || 'Não informado',
    identidade_genero: data.identidadeGenero,
    orientacao: data.orientacao,
    genero_busca: data.generoBusca.join(', '),
    estado: data.estado,
    cidade: data.cidade,
  };

  return sendEmail(TEMPLATE_LGBT_SIGNUP, params);
};

/**
 * Enviar email de contato
 */
export const sendContactEmail = async (data: {
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
}): Promise<boolean> => {
  const params: EmailParams = {
    to_email: 'contato@flashdate.com.br',
    to_name: 'Flashdate',
    cliente_nome: data.nome,
    cliente_email: data.email,
    assunto: data.assunto,
    mensagem: data.mensagem,
    send_date: new Date().toLocaleDateString('pt-BR'),
  };

  return sendEmail(TEMPLATE_CONTACT_MESSAGE, params);
};

export interface MatchResult {
  userId: string;
  matchedUserId: string;
  matchedName: string;
  matchedEmail: string;
  matchedWhatsapp?: string;
}

/**
 * Enviar email com matches para o usuário
 * Chamado pelo admin após aprovar envio de matches
 */
export const sendMatchEmail = async (data: {
  recipientName: string;
  recipientEmail: string;
  eventTitle: string;
  matches: MatchResult[];
}): Promise<boolean> => {
  if (!data.matches || data.matches.length === 0) {
    console.warn('Nenhum match para enviar');
    return true; // Não há erro, apenas sem matches
  }

  // Formatar lista de matches em HTML
  const matchesList = data.matches
    .map((match, index) => {
      const whatsapp = match.matchedWhatsapp || 'Não informado';
      return `
        <div style="margin-bottom: 16px; padding: 12px; background-color: #f5f5f5; border-radius: 8px; border-left: 4px solid #ff6b9d;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #333;">
            ${index + 1}. ${match.matchedName}
          </p>
          <p style="margin: 4px 0; color: #666; font-size: 14px;">
            Email: <a href="mailto:${match.matchedEmail}" style="color: #ff6b9d; text-decoration: none;">${match.matchedEmail}</a>
          </p>
          <p style="margin: 4px 0; color: #666; font-size: 14px;">
            WhatsApp: ${whatsapp}
          </p>
        </div>
      `;
    })
    .join('');

  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Seus Matches!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Evento: ${data.eventTitle}</p>
      </div>
      
      <div style="padding: 30px 20px;">
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Oi <strong>${data.recipientName}</strong>!
        </p>
        
        <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 16px 0;">
          A administração analisou todas as seleções e encontrou <strong>${data.matches.length}</strong> match(es) para você!
        </p>
        
        <p style="color: #666; font-size: 15px; font-weight: bold; margin: 24px 0 12px 0;">
          Aqui estão os seus matches:
        </p>
        
        ${matchesList}
        
        <p style="color: #666; font-size: 14px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee;">
          Entre em contato com seus matches e aproveite a oportunidade de conhecer alguém especial!
        </p>
        
        <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
          Flashdate - Encontre conexões reais
        </p>
      </div>
    </div>
  `;

  try {
    // Enviar usando template genérico ou criar novo template customizado
    // Por enquanto vamos usar sendEmail com um template que aceita HTML
    const params: EmailParams = {
      to_email: data.recipientEmail,
      to_name: data.recipientName,
      subject: `Seus matches do evento ${data.eventTitle} estão aqui! 💕`,
      html_body: emailBody,
      event_title: data.eventTitle,
      matches_count: data.matches.length.toString(),
    };

    // Tenta enviar com credenciais existentes
    if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error('EmailJS não configurado');
      return false;
    }

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATE_CONTACT_MESSAGE, // Usa um template flexível
      params as Record<string, unknown>,
      EMAILJS_PUBLIC_KEY
    );

    console.log('Email de matches enviado com sucesso para:', data.recipientEmail);
    return response.status === 200;
  } catch (error) {
    console.error('Erro ao enviar email de matches:', error);
    return false;
  }
};
