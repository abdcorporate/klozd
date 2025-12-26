import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env') });

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';

async function testResend() {
  if (!resendApiKey) {
    console.error('❌ RESEND_API_KEY n\'est pas configuré dans .env');
    process.exit(1);
  }

  console.log('🔍 Test de connexion à Resend...');
  console.log(`📧 Clé API: ${resendApiKey.substring(0, 10)}...`);
  console.log(`📧 Email FROM: ${emailFrom}`);
  console.log(`📧 Email TO: hamza@abdessadek.com`);
  console.log('');

  const resend = new Resend(resendApiKey);

  try {
    console.log('📤 Envoi de l\'email de test...');
    const result = await resend.emails.send({
      from: emailFrom,
      to: 'hamza@abdessadek.com',
      subject: 'Test de vérification - KLOZD',
      html: `
        <h2>Test d'envoi d'email</h2>
        <p>Ceci est un email de test pour vérifier la configuration Resend.</p>
        <p>Si vous recevez cet email, la configuration est correcte !</p>
      `,
      text: 'Ceci est un email de test pour vérifier la configuration Resend.',
    });

    if (result.error) {
      console.error('❌ Erreur Resend:');
      console.error(JSON.stringify(result.error, null, 2));
      process.exit(1);
    }

    console.log('✅ Email envoyé avec succès !');
    console.log(`📧 ID de l'email: ${result.data?.id || 'N/A'}`);
    console.log('');
    console.log('💡 Vérifiez votre boîte de réception (et le dossier spam)');
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'envoi:');
    console.error(error.message);
    console.error('');
    console.error('Stack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

testResend();



