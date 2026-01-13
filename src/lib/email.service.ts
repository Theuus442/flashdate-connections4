import emailjs from '@emailjs/browser';

// Credenciais emailJS
const EMAILJS_SERVICE_ID = 'service_6uy9uzh';
const EMAILJS_PUBLIC_KEY = 'XhoyJTnDjVfa2N392';

// IDs dos templates
const TEMPLATE_LGBT_SIGNUP = 'template_0jjfojk';
const TEMPLATE_CONTACT_MESSAGE = 'template_2c90s2n';

// Inicializar emailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

interface EmailParams {
  [key: string]: string | string[];
}

/**
 * Enviar email genérico
 */
const sendEmail = async (templateId: string, params: EmailParams): Promise<boolean> => {
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
