import { performance } from 'perf_hooks';

const TaskStatus = Object.freeze({
  BACKLOG: 'Backlog',
  NOT_STARTED: 'Not Started',
  PLANNING: 'Planning',
  IN_PROGRESS: 'In-Progress',
  BLOCKED: 'Blocked',
  DONE: 'Done'
});

const labels = Array.from({ length: 100 }, (_, i) => ({ name: `label${i}` }));
labels.push({ name: TaskStatus.IN_PROGRESS }, { name: TaskStatus.DONE });

const benchmarkOriginal = () => {
  let start = performance.now();
  for (let i = 0; i < 100000; i++) {
    const otherLabels = labels.filter(l => !Object.values(TaskStatus).includes(l.name)).map(l => l.name);
  }
  let end = performance.now();
  return end - start;
};

const taskStatusSet = new Set(Object.values(TaskStatus));
const benchmarkOptimized = () => {
  let start = performance.now();
  for (let i = 0; i < 100000; i++) {
    const otherLabels = labels.filter(l => !taskStatusSet.has(l.name)).map(l => l.name);
  }
  let end = performance.now();
  return end - start;
};

console.log("Original: ", benchmarkOriginal(), "ms");
console.log("Optimized: ", benchmarkOptimized(), "ms");
