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

import { HypesquadHouse, UserFlags } from "@spacebar/schemas";
import { BitFieldResolvable } from "./BitField";

export const HYPESQUAD_HOUSES = Object.values(HypesquadHouse).filter((house): house is HypesquadHouse => typeof house === "number");

// each house has a matching HOUSE_<NAME> user flag
export const hypesquadHouseFlag = (house: HypesquadHouse) => `HOUSE_${HypesquadHouse[house]}`;

const HOUSE_NAMES: Record<HypesquadHouse, string> = {
    [HypesquadHouse.BRAVERY]: "Bravery",
    [HypesquadHouse.BRILLIANCE]: "Brilliance",
    [HypesquadHouse.BALANCE]: "Balance",
};

// house badges arent stored in the badges table, they follow the flag set by /hypesquad/online
// instancee owners can provide the icons as badge-icons/hypesquad_house_<number>.png
export function getHypesquadBadges(flags: BitFieldResolvable) {
    const userFlags = new UserFlags(flags);
    return HYPESQUAD_HOUSES.filter((house) => userFlags.has(hypesquadHouseFlag(house))).map((house) => ({
        id: `hypesquad_house_${house}`,
        description: `HypeSquad ${HOUSE_NAMES[house]}`,
        icon: `hypesquad_house_${house}`,
    }));
}
