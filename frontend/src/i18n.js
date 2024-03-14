import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
        debug: true,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        "resources": {
            "en": {
                "translation": {
                    "connect": "Connect User",
                    "disconnect": "Disconnect User",
                    "connected": "Connected",
                    "disconnected": "Disconnected",
                    "chooseThreadsToShare": "Choose threads to share",
                    "next": "Next",
                    "previous": "Previous",
                    "thankYouForSubmittingSurvey": "Thank you for submitting the survey",
                    "name": "Name",
                    "username": "User Name",
                    "agreeToTermsAndConditions": "I agree to the terms and conditions",
                    "takeShortSurvey": "Take a short survey",
                    "generateQR": "Generate QR",
                    "complete": "Complete",
                    "logOut": "Log out",
                    "LOGGING_MESSAGES": "LOGGING MESSAGES",
                    "DOWNLOADING_MEDIA": "DOWNLOADING MEDIA",
                    "ANONYMIZING_DATA": "ANONYMIZING DATA",
                    "DISCONNECTED": "DISCONNECTED",
                    "LOGGING_CHATS": "LOGGING CHATS",
                    "CONNECTED": "CONNECTED",
                    "LOGGING_CONTACTS": "LOGGING CONTACTS",
                    "-": "-",
                    "signInToYourAccount": "Sign In to your Account",
                    "password": "Password",
                    "rememberThisDevice": "Remember this device",
                    "qrInstructionDescription": "You will now be asked to scan the QR code from the user's phone.",
                    "followInstructions": "Follow the instructions below:",
                    "instruction1": "Open WhatsApp on the user's phone.",
                    "instruction2.1": "Tap Menu",
                    "instruction2.2": "or Settings",
                    "instruction2.3": "and select",
                    "instruction2.4": "Linked Devices",
                    "instruction3": "Select Link a new device.",
                    "instruction4": "Press the button below to Generate QR Code.",
                    "instruction5": "Scan the QR code from the user's phone."
                }
            },
            "hi": {
                "translation": {
                    "connect": "Connect User",
                    "disconnect": "Disconnect User",
                    "connected": "Connected",
                    "disconnected": "Disconnected",
                    "chooseThreadsToShare": "Choose threads to share",
                    "next": "Next",
                    "previous": "Previous",
                    "thankYouForSubmittingSurvey": "Thank you for submitting the survey",
                    "name": "Name",
                    "username": "User Name",
                    "agreeToTermsAndConditions": "I agree to the terms and conditions",
                    "takeShortSurvey": "Take a short survey",
                    "generateQR": "Generate QR",
                    "complete": "Complete",
                    "logOut": "Log out",
                    "LOGGING_MESSAGES": "LOGGING MESSAGES",
                    "DOWNLOADING_MEDIA": "DOWNLOADING MEDIA",
                    "ANONYMIZING_DATA": "ANONYMIZING DATA",
                    "DISCONNECTED": "DISCONNECTED",
                    "LOGGING_CHATS": "LOGGING CHATS",
                    "CONNECTED": "CONNECTED",
                    "LOGGING_CONTACTS": "LOGGING CONTACTS",
                    "-": "-",
                    "signInToYourAccount": "Sign In to your Account",
                    "password": "Password",
                    "rememberThisDevice": "Remember this device",
                    "qrInstructionDescription": "You will now be asked to scan the QR code from the user's phone.",
                    "followInstructions": "Follow the instructions below:",
                    "instruction1": "Open WhatsApp on the user's phone.",
                    "instruction2.1": "Tap Menu",
                    "instruction2.2": "or Settings",
                    "instruction2.3": "and select",
                    "instruction2.4": "Linked Devices",
                    "instruction3": "Select Link a new device.",
                    "instruction4": "Press the button below to Generate QR Code.",
                    "instruction5": "Scan the QR code from the user's phone."
                }
            },
            "pt": {
                "translation": {
                    "connect": "Conectar usuário",
                    "disconnect": "Desconectar usuário",
                    "connected": "Conectado",
                    "disconnected": "Desconectado",
                    "chooseThreadsToShare": "Escolha os grupos para compartilhar",
                    "next": "Próxima",
                    "previous": "Anterior",
                    "thankYouForSubmittingSurvey": "Obrigado por enviar a pesquisa",
                    "name": "Nome",
                    "username": "Nome de usuário",
                    "agreeToTermsAndConditions": "Eu concordo com os termos e condições",
                    "takeShortSurvey": "Responda a uma breve pesquisa",
                    "generateQR": "Gerar QR",
                    "complete": "Concluir",
                    "logOut": "Fazer logout",
                    "LOGGING_MESSAGES": "REGISTRO DE MENSAGENS",
                    "DOWNLOADING_MEDIA": "BAIXANDO MÍDIA",
                    "ANONYMIZING_DATA": "ANONIMIZANDO DADOS",
                    "DISCONNECTED": "DESCONECTADO",
                    "LOGGING_CHATS": "REGISTRO DE CHATS",
                    "CONNECTED": "CONECTADO",
                    "LOGGING_CONTACTS": "REGISTRO DE CONTATOS",
                    "-": "-",
                    "signInToYourAccount": "Faça login em sua conta",
                    "password": "Senha",
                    "rememberThisDevice": "Lembre-se deste dispositivo",
                    "qrInstructionDescription": "Agora você será solicitado a scanear o QR Code do telefone do usuário",
                    "followInstructions": "Siga as instruções abaixo:",
                    "instruction1": "Abra o Whatsapp no celular do usuário.",
                    "instruction2.1": "Toque em Menu",
                    "instruction2.2": "ou configurações",
                    "instruction2.3": "e selecione",
                    "instruction2.4": "Aparelhos Conectados",
                    "instruction3": "Selecione conectar um novo aparelho.",
                    "instruction4": "Pressione o botão para gerar o QR Code.",
                    "instruction5": "Scaneie o QR Code do telefone do usuário."
                }
            },
            "es": {
                "translation": {
                    "connect": "Conectar usuario",
                    "disconnect": "Desconectar usuario",
                    "connected": "Conectado",
                    "disconnected": "Desconectado",
                    "chooseThreadsToShare": "Elegir grupos para compartir",
                    "next": "Siguiente",
                    "previous": "Anterior",
                    "thankYouForSubmittingSurvey": "Gracias por enviar la encuesta",
                    "name": "Nombre",
                    "username": "Nombre de usuario",
                    "agreeToTermsAndConditions": "Estoy de acuerdo con los términos y condiciones",
                    "takeShortSurvey": "Realizar una encuesta corta",
                    "generateQR": "Generar QR",
                    "complete": "Completar",
                    "logOut": "Cerrar sesión",
                    "LOGGING_MESSAGES": "REGISTRO DE MENSAJES",
                    "DOWNLOADING_MEDIA": "DESCARGANDO MEDIOS",
                    "ANONYMIZING_DATA": "ANONIMIZACIÓN DE DATOS",
                    "DISCONNECTED": "DESCONECTADO",
                    "LOGGING_CHATS": "REGISTRO DE CHATS",
                    "CONNECTED": "CONECTADO",
                    "LOGGING_CONTACTS": "REGISTRO DE CONTACTOS",
                    "-": "-",
                    "signInToYourAccount": "Inicia sesión en tu cuenta",
                    "password": "Contraseña",
                    "rememberThisDevice": "Recordar este dispositivo",
                    "qrInstructionDescription": "Ahora se te pedirá que escanees el código QR del teléfono del usuario.",
                    "followInstructions": "Siga las instrucciones a continuación:",
                    "instruction1": "Abre WhatsApp en el teléfono del usuario.",
                    "instruction2.1": "Toca en Menú",
                    "instruction2.2": "o Configuración",
                    "instruction2.3": "y selecciona",
                    "instruction2.4": "Dispositivos vinculados",
                    "instruction3": "Selecciona Vincular un nuevo dispositivo.",
                    "instruction4": "Presiona el botón de abajo para Generar el código QR.",
                    "instruction5": "Escanee el código QR del teléfono del usuario."
                }
            }
        }


    });

export default i18n;