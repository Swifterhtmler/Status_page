// api/status.js
export default async function handler(req, res) {
  // Load Upstash credentials from Vercel's environment variables
  const UPSTASH_REST_URL = process.env.UPSTASH_REDIS_REST_URL; // Updated variable name
  const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;   // Updated variable name

  if (req.method === "GET") {
   res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
   res.setHeader('Pragma', 'no-cache');
   res.setHeader('Expires', '0');

    // Fetch the current status from Upstash
    try {
      const response = await fetch(`${UPSTASH_REST_URL}/get/status`, {
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
        },
      });
      const data = await response.json();
      const status = typeof data.result === "object" && data.result !== null
        ? data.result.value
        : data.result;
      res.status(200).json({ status: status || "Paikalla" });
    } catch (error) {
      console.error("Error fetching from Upstash:", error);
      res.status(500).json({ error: "Failed to fetch status" });
    }
  }



  else if (req.method === "POST") {
    try {
      // 1. Varmistetaan että body luetaan oikein, tuli se tekstinä tai objektina
      let parsedBody = req.body;
      if (typeof req.body === "string") {
        parsedBody = JSON.parse(req.body);
      }

      const status = parsedBody?.status;

      // 2. Jos status on tyhjä, pysäytetään ja kerrotaan syy heti
      if (!status) {
        return res.status(400).json({ 
          error: "Status-kenttä puuttuu!", 
          receivedBody: req.body 
        });
      }

      // 3. Tallennetaan puhdas teksti Upstashiin
      await fetch(`${UPSTASH_REST_URL}/set/status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(status),
      });

      // 4. Palautetaan kuittaus ja tallennettu teksti
      res.status(200).json({ success: true, savedStatus: status });

    } catch (error) {
      console.error("Error updating Upstash:", error);
      res.status(500).json({ error: "Failed to update status", details: error.message });
    }
  }

  

  else {
    res.status(405).json({ error: "Method not allowed" });
  }
}