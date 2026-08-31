import { runAllTests } from '../server/tests/e2e.test';

async function main() {
  console.log('====================================================');
  console.log('ResearchFlow AI End-to-End Automated Test Suite');
  console.log('====================================================\n');

  const { total, passed, failed, results } = await runAllTests();

  console.log('\n----------------------------------------------------');
  console.log(`Results: ${passed}/${total} passed (${failed} failed)`);
  console.log('----------------------------------------------------\n');

  if (failed > 0) {
    console.error('Test failures:');
    results.filter(r => !r.passed).forEach(r => {
      console.error(`- [${r.suite}] ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('All tests passed successfully!');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
