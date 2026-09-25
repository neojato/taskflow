const generateIssues = (count) => {
  const issues = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(Date.now() - Math.random() * 10000000000);
    issues.push({
      id: i,
      created_at: date.toISOString(),
    });
  }
  return issues;
};

const issues = generateIssues(5000);

const start1 = performance.now();
const sorted1 = [...issues].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
const end1 = performance.now();
console.log(`new Date() in sort took ${end1 - start1} ms`);

const processedIssues = issues.map(i => ({...i, created_at_ms: Date.parse(i.created_at)}));

const start2 = performance.now();
const sorted2 = [...processedIssues].sort((a, b) => a.created_at_ms - b.created_at_ms);
const end2 = performance.now();
console.log(`created_at_ms in sort took ${end2 - start2} ms`);

const start3 = performance.now();
const sorted3 = [...issues].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
const end3 = performance.now();
console.log(`Date.parse() in sort took ${end3 - start3} ms`);
