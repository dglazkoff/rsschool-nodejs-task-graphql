import {PrismaClient} from "@prisma/client";
import {GraphQLEnumType} from "graphql/type/index.js";
import {MemberTypeId} from "../../member-types/schemas.js";
import DataLoader from "dataloader";

export type Context = {
    db: PrismaClient;
    dataloaders: Map<string, DataLoader<unknown, unknown>>;
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