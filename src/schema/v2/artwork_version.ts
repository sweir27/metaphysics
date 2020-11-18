import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLFieldConfig,
  GraphQLList,
  GraphQLBoolean,
} from "graphql"
import { artistNames } from "./artwork/meta"
import Image from "./image"
import { ResolverContext } from "types/graphql"
import { InternalIDFields, NodeInterface } from "./object_identification"
import Artist from "./artist"
import { symbolFromCurrencyCode } from "schema/v1/fields/money"
import { formatMoney } from "accounting"
import { displayMoneyRange } from "lib/moneyHelper"

export const ArtworkVersionType = new GraphQLObjectType<any, ResolverContext>({
  name: "ArtworkVersion",
  interfaces: [NodeInterface],
  fields: () => ({
    ...InternalIDFields,

    title: {
      type: GraphQLString,
      description: "Artwork title",
    },

    defaultImageID: {
      type: GraphQLString,
      description: "The Image id",
      resolve: ({ default_image_id }) => default_image_id,
    },

    artists: {
      type: new GraphQLList(Artist.type),
      description: "The artists related to this Artwork Version",
      resolve: (version, _options, { artistsLoader }) =>
        artistsLoader({ ids: version.artist_ids }),
    },

    artistNames: {
      type: GraphQLString,
      description: "The names for the artists related to this Artwork Version",
      resolve: async (version, _options, { artistsLoader }) => {
        const artists = await artistsLoader({ ids: version.artist_ids })
        return artistNames({ artists })
      },
    },

    image: {
      type: Image.type,
      description: "The image representing the Artwork Version",
      resolve: (version, _options, { artworkImageLoader }) =>
        artworkImageLoader({
          artwork_id: version.artwork_id,
          image_id: version.default_image_id,
        }),
    },
    displayPriceRange: {
      type: GraphQLBoolean,
      description: "Describes whether or not a price range should be displayed",
      resolve: ({ display_price_range }) => display_price_range,
    },
    displayPrice: {
      type: GraphQLString,
      description: "The price of the artwork version, as range or exact price.",
      resolve: ({
        price_hidden,
        price_listed,
        price_min,
        price_max,
        price_currency,
      }) => {
        if (price_hidden) {
          return ""
        }
        if (!price_listed && !price_min && !price_max) {
          return ""
        }

        const symbol = symbolFromCurrencyCode(price_currency) ?? "$"

        if (price_listed) {
          return formatMoney(price_listed, symbol, 0)
        }

        return displayMoneyRange({
          min: price_min,
          max: price_max,
          symbol: symbol,
        })
      },
    },
  }),
})

export const ArtworkVersionResolver: GraphQLFieldConfig<
  any,
  ResolverContext
> = {
  type: ArtworkVersionType,
  description: "A subset of the metadata for an artwork at a specific time",
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The ID of the ArtworkVersion",
    },
  },
  resolve: (_root, { id }, { authenticatedArtworkVersionLoader }) =>
    authenticatedArtworkVersionLoader
      ? authenticatedArtworkVersionLoader(id)
      : null,
}

export default ArtworkVersionResolver
