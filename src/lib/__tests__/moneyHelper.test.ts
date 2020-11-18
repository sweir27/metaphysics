import { displayMoneyRange } from "lib/moneyHelper"

describe("moneyHelper", () => {
  describe("displayMoneyRange", () => {
    describe("with a min and max", () => {
      it("returns a proper display for USD", () => {
        expect(
          displayMoneyRange({ min: 2000, max: 4000, symbol: "$" })
        ).toEqual("$2,000 - 4,000")
      })

      it("returns a proper display for EUR", () => {
        expect(
          displayMoneyRange({ min: 2000, max: 4000, symbol: "€" })
        ).toEqual("€2,000 - 4,000")
      })
    })

    describe("with just a min", () => {
      it("returns a proper display for USD", () => {
        expect(
          displayMoneyRange({ min: 2000, max: undefined, symbol: "$" })
        ).toEqual("$2,000 and up")
      })

      it("returns a proper display for EUR", () => {
        expect(
          displayMoneyRange({ min: 2000, max: undefined, symbol: "€" })
        ).toEqual("€2,000 and up")
      })
    })

    describe("with just a max", () => {
      it("returns a proper display for USD", () => {
        expect(
          displayMoneyRange({ min: undefined, max: 2000, symbol: "$" })
        ).toEqual("Under $2,000")
      })

      it("returns a proper display for EUR", () => {
        expect(
          displayMoneyRange({ min: undefined, max: 2000, symbol: "€" })
        ).toEqual("Under €2,000")
      })
    })

    describe("without a min or a max", () => {
      it("returns an empty string", () => {
        expect(
          displayMoneyRange({ min: undefined, max: undefined, symbol: "$" })
        ).toEqual("")
      })
    })
  })
})
