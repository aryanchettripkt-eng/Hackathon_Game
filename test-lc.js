async function main() {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        title
        content
      }
    }
  `;

  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { titleSlug: "check-if-n-and-its-double-exist" }
    })
  });
  
  const data = await response.json();
  console.log(data.data.question.title);
  console.log(data.data.question.content.substring(0, 200));
}

main().catch(console.error);
