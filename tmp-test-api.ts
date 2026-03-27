async function main() {
  console.log("Testing POST to resend-verification...");
  try {
    const res = await fetch('http://localhost:3000/api/auth/resend-verification', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "truthokoye@gmail.com" })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}
main();
