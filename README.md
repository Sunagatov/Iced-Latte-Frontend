# Coffee Store

## Project setup

- navigate to the root of the project
- `yarn install`
- `yarn husky install` - setup precommit eslint typescript checks
- `yarn dev` - runs project on `localhost:3000` (if on the main page u do not see list of products due to CORS error, run dev server with `yarn next dev --hostname 127.0.0.1`)

## Project structure

<pre>
  <b>- public/</b>  <i>(static files)</i>
  <b>- src/</b>  <i>(sources directory)</i>
    <b>- app/</b>
      <b>- _components/</b>  (components used by current page)
      <b>- someRouteFolder/</b>  <i>(some rote page)</i>
        <b>- _components/</b>  <i>(someRoute page components)</i>
        <i>page.tsx</i>  <i>(someRoute page)</i>
      <i>globals.css</i>  <i>(global styles)</i>
      <i>layout.tsx</i>  <i>(root layout)</i>
      <i>page.tsx</i>  <i>(main page)</i>
    <b>- components</b>  <i>(shared components across application)</i>
      <b>- ui</b>  <i>(shared ui components (buttons, etc.))</i>
    <b>- constants</b>  <i>(temporary hardcoded values)</i>
    <b>- data</b>  <i>(temporary mocked data)</i>
    <b>- hooks</b>  <i>(custom hooks)</i>
    <b>- models</b>  <i>(typescript types)</i>
    <b>- services</b>
    <b>- utils</b>  <i>(utility functions)</i>
    <i>tailwind.config.ts</i>  <i>(tailwind custom classes)</i>
</pre>
