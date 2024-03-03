import {PrismaClient} from "@prisma/client";
import {GraphQLEnumType} from "graphql/type/index.js";
import {MemberTypeId} from "../../member-types/schemas.js";

export type Context = {
    db: PrismaClient;
}

export const memberTypeId = new GraphQLEnumType({
    name: 'MemberTypeId',
    values: {
        [MemberTypeId.BASIC]: {
            value: MemberTypeId.BASIC,
        },
        [MemberTypeId.BUSINESS]: {
            value: MemberTypeId.BUSINESS,
        },
    },
});