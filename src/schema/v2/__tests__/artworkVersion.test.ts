import { runQuery } from "schema/v2/test/utils"
import { GraphQLObjectType, GraphQLSchema } from "graphql"
import { ArtworkVersionResolver } from "../artwork_version"

// Artwork Version has no need to be at the root, so in order
// to test it without having to mock stitched data, this
// creates a test schema and exposes `artworkVersion` as a root-level
// field.
const testSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      artworkVersion: ArtworkVersionResolver,
    },
  }),
})

const artworkVersionResponse = (item = {}) => {
  return {
    id: "hello",
    price_listed: 1000,
    price_hidden: false,
    price_min: null,
    price_max: null,
    price_currency: "USD",
    ...item,
  }
}

const query = `
  {
    artworkVersion(id: "meow") {
      displayPrice
    }
  }
`

describe("Artwork version", () => {
  describe("displayPrice", () => {
    it("works for an exact price", async () => {
      const authenticatedArtworkVersionLoader = jest
        .fn()
        .mockReturnValueOnce(Promise.resolve(artworkVersionResponse()))

      const { artworkVersion } = await runQuery(
        query,
        { authenticatedArtworkVersionLoader },
        {},
        testSchema
      )
      expect(artworkVersion).toEqual({ displayPrice: "$1,000" })
    })

    it("works for a price range", async () => {
      const customData = {
        price_listed: null,
        price_min: 1000,
        price_max: 3000,
      }
      const authenticatedArtworkVersionLoader = jest
        .fn()
        .mockReturnValueOnce(
          Promise.resolve(artworkVersionResponse(customData))
        )

      const { artworkVersion } = await runQuery(
        query,
        { authenticatedArtworkVersionLoader },
        {},
        testSchema
      )
      expect(artworkVersion).toEqual({ displayPrice: "$1,000 - 3,000" })
    })

    it("works for a price min", async () => {
      const customData = {
        price_listed: null,
        price_min: 1000,
        price_max: null,
      }
      const authenticatedArtworkVersionLoader = jest
        .fn()
        .mockReturnValueOnce(
          Promise.resolve(artworkVersionResponse(customData))
        )

      const { artworkVersion } = await runQuery(
        query,
        { authenticatedArtworkVersionLoader },
        {},
        testSchema
      )
      expect(artworkVersion).toEqual({ displayPrice: "$1,000 and up" })
    })

    it("works for a price max", async () => {
      const customData = {
        price_listed: null,
        price_min: null,
        price_max: 5000,
      }
      const authenticatedArtworkVersionLoader = jest
        .fn()
        .mockReturnValueOnce(
          Promise.resolve(artworkVersionResponse(customData))
        )

      const { artworkVersion } = await runQuery(
        query,
        { authenticatedArtworkVersionLoader },
        {},
        testSchema
      )
      expect(artworkVersion).toEqual({ displayPrice: "Under $5,000" })
    })

    it("works when the price is hidden", async () => {
      const customData = {
        price_listed: null,
        price_min: null,
        price_max: 5000,
        price_hidden: true,
      }
      const authenticatedArtworkVersionLoader = jest
        .fn()
        .mockReturnValueOnce(
          Promise.resolve(artworkVersionResponse(customData))
        )

      const { artworkVersion } = await runQuery(
        query,
        { authenticatedArtworkVersionLoader },
        {},
        testSchema
      )
      expect(artworkVersion).toEqual({ displayPrice: "" })
    })

    it("works when there is no price data", async () => {
      const customData = {
        price_listed: null,
        price_min: null,
        price_max: null,
      }
      const authenticatedArtworkVersionLoader = jest
        .fn()
        .mockReturnValueOnce(
          Promise.resolve(artworkVersionResponse(customData))
        )

      const { artworkVersion } = await runQuery(
        query,
        { authenticatedArtworkVersionLoader },
        {},
        testSchema
      )
      expect(artworkVersion).toEqual({ displayPrice: "" })
    })

    it("works when there is a non-USD currency", async () => {
      const customData = {
        price_listed: 5000,
        price_min: null,
        price_max: null,
        price_currency: "GBP",
      }
      const authenticatedArtworkVersionLoader = jest
        .fn()
        .mockReturnValueOnce(
          Promise.resolve(artworkVersionResponse(customData))
        )

      const { artworkVersion } = await runQuery(
        query,
        { authenticatedArtworkVersionLoader },
        {},
        testSchema
      )
      expect(artworkVersion).toEqual({ displayPrice: "£5,000" })
    })
  })
})
