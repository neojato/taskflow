import { runTests } from './tests/logic.js';

(async () => {
  const results = await runTests(null, {});
  console.log(JSON.stringify(results, null, 2));
  const failed = results.filter(r => r.status === 'failed');
  if (failed.length > 0) {
    console.error('Tests failed:', failed);
    process.exit(1);
  }
  console.log('All tests passed!');
})();
