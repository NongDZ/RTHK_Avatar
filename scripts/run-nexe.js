const path = require('path');
const { compile } = require('nexe');
const config = require('../nexe.config.json');

(async () => {
  const root = path.resolve(__dirname, '..');

  await compile({
    cwd: root,
    ...config,
    input: path.resolve(root, config.input),
    output: path.resolve(root, config.output),
    resources: (config.resources || []).map(pattern =>
      path.resolve(root, pattern)
    ),
    temp: path.resolve(root, config.temp || 'build/.nexe-tmp'),
  });

  console.log('[nexe] build complete ->', config.output);
})().catch((err) => {
  console.error('[nexe] build failed:', err);
  process.exit(1);
});