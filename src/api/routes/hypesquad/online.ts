/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { route } from "@spacebar/api/middlewares";
import { User } from "@spacebar/database";
import { HypesquadHouse, HypesquadOnlineSchema, PrivateUserProjection, UserFlags } from "@spacebar/schemas";
import { emitEvent, HYPESQUAD_HOUSES, hypesquadHouseFlag, UserUpdateEvent } from "@spacebar/util";
import { Request, Response, Router } from "express";

const router = Router({ mergeParams: true });

const HOUSE_FLAGS = HYPESQUAD_HOUSES.map(hypesquadHouseFlag);

// ugh
async function setHouse(user_id: string, house?: HypesquadHouse) {
    const user = await User.findOneOrFail({
        where: { id: user_id },
        select: Object.fromEntries(PrivateUserProjection.map((i) => [i, true])),
    });

    // houses are mutually exclusive, so joining one leaves any other
    const flags = new UserFlags(user.flags).remove(...HOUSE_FLAGS);
    const publicFlags = new UserFlags(user.public_flags).remove(...HOUSE_FLAGS);
    if (house) {
        flags.add(hypesquadHouseFlag(house));
        publicFlags.add(hypesquadHouseFlag(house));
    }

    user.flags = Number(flags.bitfield);
    user.public_flags = Number(publicFlags.bitfield);
    await user.save();

    await emitEvent({
        event: "USER_UPDATE",
        user_id,
        data: user,
    } satisfies UserUpdateEvent);
}

router.post(
    "/",
    route({
        requestBody: "HypesquadOnlineSchema",
        responses: {
            204: {},
            400: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { house_id } = req.body as HypesquadOnlineSchema;
        await setHouse(req.user_id, house_id);
        res.sendStatus(204);
    },
);

router.delete(
    "/",
    route({
        responses: {
            204: {},
        },
    }),
    async (req: Request, res: Response) => {
        await setHouse(req.user_id);
        res.sendStatus(204);
    },
);

export default router;
