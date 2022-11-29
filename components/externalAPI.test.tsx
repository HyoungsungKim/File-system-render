import { login } from "./externalAPI"

const MOCK_RESPONSE = true

global.fetch = jest.fn().mockImplementationOnce(() => 
  Promise.resolve({
    status: 400,
    json: () => Promise.resolve({
        result: "Success",
        message: "확인완료"
    }),
  })
)

describe("Login API test", () => {
    it("Login", async () => {
        const res = await login("phsju", "Qwe789!@#")
        console.log(res)
        expect(res).toEqual(true)
    })
})