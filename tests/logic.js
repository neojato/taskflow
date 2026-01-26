import { TaskStatus, TaskPriority } from '../types.js';
import { processIssue, parseProgress } from '../utils.js';

/**
 * TaskFlow Test Suite
 * These tests run in-browser to verify core logic.
 */
export const runTests = async (githubService, supabase) => {
  const results = [];

  const assert = (name, condition, errorMsg) => {
    results.push({ name, status: condition ? 'passed' : 'failed', message: condition ? 'OK' : errorMsg });
  };

  // 1. Utility Tests
  console.group('Testing: Utilities');
  assert('Progress Calculation (0%)', parseProgress('No tasks here') === 0, 'Should return 0 for no tasks');
  assert('Progress Calculation (50%)', parseProgress('- [x] Done\n- [ ] Pending') === 50, 'Should return 50 for 1/2 tasks');
  assert('Progress Calculation (100%)', parseProgress('- [x] All\n- [x] Done') === 100, 'Should return 100 for all done');
  console.groupEnd();

  // 2. Data Processing Tests
  console.group('Testing: Issue Processing');
  const mockIssue = {
    number: 1,
    title: 'Test',
    body: '- [x] Work',
    labels: [{ name: TaskStatus.IN_PROGRESS }, { name: TaskPriority.P0 }]
  };
  const processed = processIssue(mockIssue);
  assert('Label to Status Mapping', processed.status === TaskStatus.IN_PROGRESS, 'Status should be IN_PROGRESS');
  assert('Label to Priority Mapping', processed.priority === TaskPriority.P0, 'Priority should be P0');
  assert('Progress Injection', processed.progress === 100, 'Progress should be 100');
  console.groupEnd();

  // 3. Auth Flow Mock Check
  console.group('Testing: Auth Flow');
  assert('Supabase Connection', !!supabase, 'Supabase client must be initialized');
  console.groupEnd();

  return results;
};