import fs from "fs";

const path = "qa-results/vitest.json";
if (!fs.existsSync(path)) {
  console.error("JSON test result not found:", path);
  process.exit(1);
}

const json = JSON.parse(fs.readFileSync(path, "utf-8"));

let md = "";
md += `# QA Report — ${new Date().toISOString().split("T")[0]}\n\n`;

md += "## Test Summary\n";
json.testResults.forEach(suite => {
  suite.assertionResults.forEach(test => {
    const status = test.status === "passed" ? "✅" : "❌";
    md += `- ${status} **${test.fullName}**\n`;
    if (test.status === "failed") {
      md += `  - ❗ ${test.failureMessages.join("\n")}\n`;
    }
  });
});

fs.writeFileSync("qa-results/qa-report.md", md);

console.log("QA Markdown report generated.");
