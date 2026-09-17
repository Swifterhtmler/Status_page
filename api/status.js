// api/status.js
export default async function handler(req, res) {
  const UPSTASH_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
  const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (req.method === "GET") {
    try {
      const response = await fetch(`${UPSTASH_REST_URL}/get/status`, {
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
        },
      });
      const data = await response.json();
      res.status(200).json(data); // Return the raw Upstash response
    } catch (error) {
      console.error("Error fetching from Upstash:", error);
      res.status(500).json({ error: "Failed to fetch status" });
    }
  }
  else if (req.method === "POST") {
    // Update the status in Upstash
    try {
      const { status } = req.body;
      await fetch(`${UPSTASH_REST_URL}/set/status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: status }),
      });
      res.status(200).send("Status updated successfully");
    } catch (error) {
      console.error("Error updating Upstash:", error);
      res.status(500).send("Failed to update status");
    }
  }
  else {
    res.status(405).send("Method not allowed");
  }
}