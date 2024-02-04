module.exports = {
  // Type check TypeScript files
  '**/*.(ts|tsx)': () => 'npm run tsc --noEmit',

  // Lint then format TypeScript and JavaScript files
  'src/**/*.(ts|tsx|js)': (filenames) => [
    `npx eslint --fix ${filenames.join(' ')}`,
    `npx prettier --write ${filenames.join(' ')}`,
  ],

  // Format MarkDown and JSON
  '**/*.(md|json)': (filenames) =>
    `npx prettier --write ${filenames.join(' ')}`,
}
