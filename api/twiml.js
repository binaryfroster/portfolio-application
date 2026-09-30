// VOCALFLOW TELEPHONY API - DYNAMIC TWIML WEBHOOK GENERATOR
// Endpoint: GET/POST /api/twiml

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const scenario = req.query.scenario || 'flight_change';
  const customerName = req.query.name || 'Valued Client';

  const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Danielle" language="en-GB">
    Hello ${customerName}, welcome to Binary Froster VocalFlow automated priority support.
  </Say>
  <Gather input="speech" action="/api/transcribe?scenario=${scenario}" method="POST" timeout="4" speechTimeout="auto">
    <Say voice="Polly.Danielle" language="en-GB">
      Please tell me in plain English how I can assist with your reservation today.
    </Say>
  </Gather>
  <Say voice="Polly.Danielle" language="en-GB">
    We did not capture your voice input. Connecting you to a live concierge.
  </Say>
  <Dial>+442079460912</Dial>
</Response>`;

  return res.status(200).send(xmlResponse);
};
