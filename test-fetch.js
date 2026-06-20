async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/generate-challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ difficulty: "Beginner", builderRating: 1200, breakerRating: 1200 })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}
test();
