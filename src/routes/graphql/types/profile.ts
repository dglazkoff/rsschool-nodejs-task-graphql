import {GraphQLBoolean, GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLObjectType} from "graphql/index.js";
import {UUIDType} from "./uuid.js";
import {Context, memberTypeId} from "./common.js";
import {memberType} from "./memberType.js";
import DataLoader from "dataloader";

export const profile = new GraphQLObjectType<{ memberTypeId: string }, Context>({
    name: "Profile",
    fields: {
        id: { type: new GraphQLNonNull(UUIDType) },
        isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
        yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
        memberType: {
            type: memberType,
            resolve: async (profile, args, context) => {
                const { dataloaders } = context;
                let dl = dataloaders.get('memberTypes');

                if (!dl) {
                    dl = new DataLoader(async (ids  ) => {
                        const memberTypes = await context.db.memberType.findMany();

                        return ids.map(id => memberTypes.find(x => x.id === id));
                    });
                    dataloaders.set('memberTypes', dl);
                }

                return dl.load(profile.memberTypeId);
            }
        },
    },
})

export const CreateProfileInput = new GraphQLInputObjectType({
    name: "CreateProfileInput",
    fields: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        memberTypeId: { type: new GraphQLNonNull(memberTypeId) },
        isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
        yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    }
})

export const ChangeProfileInput = new GraphQLInputObjectType({
    name: "ChangeProfileInput",
    fields: {
        memberTypeId: { type: memberTypeId },
        isMale: { type: GraphQLBoolean },
        yearOfBirth: { type: GraphQLInt },
    }
})