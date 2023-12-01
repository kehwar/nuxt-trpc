export async function sayTest() {
    const meta = {
        client: import.meta.client,
    }
    const result = JSON.stringify(meta)
    return result
}

export default defineTRPCQuery(sayTest)
