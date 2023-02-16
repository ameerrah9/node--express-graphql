const express = require('express');
const app = express();
const { graphqlHTTP } = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull
} = require('graphql');

const { actors, movies } = require('./seedData');

const MovieType = new GraphQLObjectType({
    name: 'Movie',
    description: 'This represents a movie with an actor',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        title: { type: GraphQLNonNull(GraphQLString) },
        actorId: { type: GraphQLNonNull(GraphQLInt) },
        actor: {
            type: ActorType,
            resolve: (movie) => {
                return actors.find(actor => actor.id === movie.actorId);
            }
        },
    }),
});

const ActorType = new GraphQLObjectType({
    name: 'Actor',
    description: 'This represents an actor of a movie',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        movies: {
            type: new GraphQLList(MovieType),
            resolve: (actor) => {
                return movies.filter(movie => movie.actorId === actor.id);
            }
        },
    }),
});

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        movie: {
            type: MovieType,
            description: 'A single movie',
            args: {
                id: { type: GraphQLInt },
            },
            resolve: (parent, args) => movies.find(movie => movie.id === args.id),
        },
        actor: {
            type: ActorType,
            description: 'A single actor',
            args: {
                id: { type: GraphQLInt },
            },
            resolve: (parent, args) => actors.find(actor => actor.id === args.id),
        },
        movies: {
            type: new GraphQLList(MovieType),
            description: 'List of all movies',
            resolve: () => movies,
        },
        actors: {
            type: new GraphQLList(ActorType),
            description: 'List of all actors',
            resolve: () => actors,
        },
    }),
});

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addMovie: {
            type: MovieType,
            description: 'Add a new movie',
            args: {
                title: { type: GraphQLNonNull(GraphQLString) },
                actorId: { type: GraphQLNonNull(GraphQLInt) },
            },
            resolve: (parent, args) => {
                const movie = { id: movies.length + 1, title: args.title, actorId: args.actorId };
                movies.push(movie);
                return movie;
            }
        },
        addActor: {
            type: ActorType,
            description: 'Add a new actor',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) => {
                const actor = { id: actors.length + 1, name: args.name };
                actors.push(actor);
                return actor;
            }
        },
    }),
});

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType,
});

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
}));
        
        
app.listen(4000, () => console.log('Server running on port 4000'));