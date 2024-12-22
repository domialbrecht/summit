import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import polyline from '@mapbox/polyline';
import { sql } from 'drizzle-orm';
import type { DetailedActivity, StravaActivity } from './api';

const THRESHHOLD_METERS = 50;

type Attempt = {
	summitId: number;
	date: Date;
};

const toWKT = (decoded: [number, number][]) => {
	const wkt = decoded.map((coord) => `${coord[1]} ${coord[0]}`).join(', '); // lon lat order
	return `LINESTRING(${wkt})`;
};

async function summitsMatchPolyline(line: string): Promise<{ id: number }[]> {
	line =
		'{kb_Hkh}l@{C|Ab@xFyMtCwTH}E}E}FzYiAnv@wNbTaFx@Z|c@cKhh@eAjm@}C|Qx@f]yFb`@_@dWiC|GnFbKhH|l@`FjBdKsE`FzNkBfJv@lEbXhF|KvQzHY|AtYG`W^zk@mGhErDxh@tRxo@K~Efh@~cCpK~KyGfIbAbFsIbFtA|MsCdH{KdDl@te@tChPqHdUDhd@nKx_@MxHkEhEiJyJqa@gpAiLsj@sKaSmAcLoGgCsDyJdBvNhF~D_AdKxFbQaBbl@rFxh@kCtn@aKiD_EnCjAgp@_Hai@mEcL_HmM}I}B}EqHe@hQwKnAmEiDoRig@iAaVmEyLkO_QwG|@lVjmAxIdm@hQt_@\\r_@rD`IcKl\\aTse@{Ig@tA~ImDvJuIeS{AuJiC`zAkJid@uBb@[pGNz\\hEte@~Ind@iBhBcNeJMhK}KhDsElJcAjm@rGbXrApU_DhvA{DfNtGhQmE`j@zHh_@bDvi@`HpG{GnQm@|LqBlAmBfx@_A|pAwCnMlNzx@dA|v@dFjq@|FfZF~Ndg@voAbFlFf@zGbChD~McAlNbQhAjNnYfPlB~UiB|NzKm^rOeGzJbPvR`IfOOtQvr@Fl[pBG~BiPDkQrBUnHdK~DtRmHnScDhZ[js@bH|WxFxz@jE|VdDeA`Cb]cAnEnJthATtuB~CfJvHbFxl@wQtDwHvD_n@bB|OvRbs@yFkk@O}VyCsHzAe^|I}AdLvRdHlApL|KbAaRnOgGlBsJsIun@tLgSvHkBjB{KoJmi@sAw[bXn^jGkP`_@tbAl_@hQvBfIbWgx@jBq^wL}tBaJy[{MaViZoxB}^oaAwJyj@We^tVtRtCsOnOuDnOsXlJuSjAsXfKwUvCgUuD_XyDyEkIw`@{KmYkBcd@`BgTqFuQeMeH`Ur@rRjVqBiGx@cJyIuYdFnClh@eYgCuM|O_JxDqTr@m_@`Hit@b@wv@hIsYrBgWqByRhVqFzLiUhS_R|HmZrMyL`o@ohA|@sNqIeJvKia@rXqWtJ{WrQmJ\\{c@iLaq@gKs\\RsSdG{[oCqb@r[_CxFuRJwOaB_VcG}TfEeGyMgm@cMcOoKm@aBwLwTse@aTsx@O{^gF_]iNoQt@_m@sEmTnD{SkGyg@kVcWk`@ig@qe@{NgQi@qIvFiZcXgUmq@dAcRwAoIeUac@cRez@qKwPfCye@mCig@kI]qMmJci@ku@av@gcC_g@zJwd@br@ie@jAuMdQyAvM~AnWmCbD`JlW`IzJ';
	const p = polyline.decode(line);
	const wkt = toWKT(p);
	const sqlLine = sql`ST_GeographyFromText(${wkt})`;
	const summits = await db
		.select({
			id: table.summit.id,
			name: table.summit.name,
			location: table.summit.location,
			distance: sql`ST_Distance(${table.summit.location},${sqlLine})`
		})
		.from(table.summit)
		.where(sql`ST_DWithin(${table.summit.location},${sqlLine},${THRESHHOLD_METERS})`);
	return summits;
}

export async function summitAttemptsFromActivity(activity: DetailedActivity): Promise<Attempt[]> {
	const summits = await summitsMatchPolyline('');
	console.log('SUMMITS:');
	console.log(summits);

	return [];
}
