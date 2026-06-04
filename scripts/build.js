/**
 * Production build: prisma generate + next build.
 * On Windows, stop `npm run dev` first if prisma generate fails with EPERM on the query engine DLL.
 */
const { spawnSync } = require('child_process')

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: true })
  return result.status ?? 1
}

const genStatus = run('npx', ['prisma', 'generate'])
if (genStatus !== 0) {
  console.error(
    '\nprisma generate failed. If you see EPERM on query_engine-windows.dll.node, stop `npm run dev` and run `npm run build` again.\n'
  )
  process.exit(genStatus)
}

process.exit(run('npx', ['next', 'build']))
