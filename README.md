# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Notes

Weissenstein Seg: 8421766
Activity Balm/Weissenstein: 12804517711

### SQL Snippets

Get id and distance for summits within 10k of my home

```sql
SELECT id, ST_DISTANCE(summit.location, ST_GeographyFromText('Point(7.529729 47.201165)')) as distance
  FROM summit where ST_DWITHIN(summit.location, ST_GeographyFromText('Point(7.529729 47.201165)'), 10000)
```

### Testdata

SummaryLine for activity 12466471906

```txt
{kb_Hkh}l@{C|Ab@xFyMtCwTH}E}E}FzYiAnv@wNbTaFx@Z|c@cKhh@eAjm@}C|Qx@f]yFb`@_@dWiC|GnFbKhH|l@`FjBdKsE`FzNkBfJv@lEbXhF|KvQzHY|AtYG`W^zk@mGhErDxh@tRxo@K~Efh@~cCpK~KyGfIbAbFsIbFtA|MsCdH{KdDl@te@tChPqHdUDhd@nKx_@MxHkEhEiJyJqa@gpAiLsj@sKaSmAcLoGgCsDyJdBvNhF~D_AdKxFbQaBbl@rFxh@kCtn@aKiD_EnCjAgp@_Hai@mEcL_HmM}I}B}EqHe@hQwKnAmEiDoRig@iAaVmEyLkO_QwG|@lVjmAxIdm@hQt_@\\r_@rD`IcKl\\aTse@{Ig@tA~ImDvJuIeS{AuJiC`zAkJid@uBb@[pGNz\\hEte@~Ind@iBhBcNeJMhK}KhDsElJcAjm@rGbXrApU_DhvA{DfNtGhQmE`j@zHh_@bDvi@`HpG{GnQm@|LqBlAmBfx@_A|pAwCnMlNzx@dA|v@dFjq@|FfZF~Ndg@voAbFlFf@zGbChD~McAlNbQhAjNnYfPlB~UiB|NzKm^rOeGzJbPvR`IfOOtQvr@Fl[pBG~BiPDkQrBUnHdK~DtRmHnScDhZ[js@bH|WxFxz@jE|VdDeA`Cb]cAnEnJthATtuB~CfJvHbFxl@wQtDwHvD_n@bB|OvRbs@yFkk@O}VyCsHzAe^|I}AdLvRdHlApL|KbAaRnOgGlBsJsIun@tLgSvHkBjB{KoJmi@sAw[bXn^jGkP`_@tbAl_@hQvBfIbWgx@jBq^wL}tBaJy[{MaViZoxB}^oaAwJyj@We^tVtRtCsOnOuDnOsXlJuSjAsXfKwUvCgUuD_XyDyEkIw`@{KmYkBcd@`BgTqFuQeMeH`Ur@rRjVqBiGx@cJyIuYdFnClh@eYgCuM|O_JxDqTr@m_@`Hit@b@wv@hIsYrBgWqByRhVqFzLiUhS_R|HmZrMyL`o@ohA|@sNqIeJvKia@rXqWtJ{WrQmJ\\{c@iLaq@gKs\\RsSdG{[oCqb@r[_CxFuRJwOaB_VcG}TfEeGyMgm@cMcOoKm@aBwLwTse@aTsx@O{^gF_]iNoQt@_m@sEmTnD{SkGyg@kVcWk`@ig@qe@{NgQi@qIvFiZcXgUmq@dAcRwAoIeUac@cRez@qKwPfCye@mCig@kI]qMmJci@ku@av@gcC_g@zJwd@br@ie@jAuMdQyAvM~AnWmCbD`JlW`IzJ
```
