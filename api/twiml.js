// VOCALFLOW TELEPHONY API - DYNAMIC TWIML WEBHOOK GENERATOR
// Endpoint: GET/POST /api/twiml
// Binary Froster Enterprise Voice Platform
// Dynamically generates voice response XML for Twilio Voice Gateway
// Strictly zero emojis. Full regional accent support (Polly.Aditi for India, Polly.Danielle for UK, Polly.Joanna for US)

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const query = req.query || {};
  const to = query.to || '+91 7647958412';
  const customerName = query.name || (to.includes('7647958412') ? 'Binary Froster HQ' : 'Valued Client');
  const scenario = query.scenario || 'enterprise_priority';

  // Select optimal neural voice based on target destination
  let voice = 'Polly.Aditi';
  let language = 'en-IN';

  if (to.startsWith('+44')) {
    voice = 'Polly.Danielle';
    language = 'en-GB';
  } else if (to.startsWith('+1')) {
    voice = 'Polly.Joanna';
    language = 'en-US';
  } else if (to.startsWith('+91')) {
    voice = 'Polly.Aditi';
    language = 'en-IN';
  }

  const host = req.headers.host || 'voice-call-automation-delta.vercel.app';
  const transcribeActionUrl = `https://${host}/api/transcribe?scenario=${encodeURIComponent(scenario)}&to=${encodeURIComponent(to)}`;
  const mediaStreamUrl = `wss://${host}/api/media-stream`;

  const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}" language="${language}">
    Hello ${customerName}, welcome to Binary Froster VocalFlow autonomous voice telephony.
  </Say>
  <Gather input="speech" action="${transcribeActionUrl}" method="POST" timeout="5" speechTimeout="auto">
    <Say voice="${voice}" language="${language}">
      I am Sarah, your AI systems concierge. Please tell me in plain English how I can assist your operations today.
    </Say>
  </Gather>
  <Say voice="${voice}" language="${language}">
    I did not detect your voice input. Transferring your call to Studio Director Shivam.
  </Say>
  <Dial>+917647958412</Dial>
</Response>`;

  return res.status(200).send(xmlResponse);
};
