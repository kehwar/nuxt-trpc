export async function sayGoodbye() {
    return 'goodbye'
}

export default defineTRPCQuery(sayGoodbye)
