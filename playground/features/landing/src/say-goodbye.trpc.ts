export async function sayGoodbye() {
    return 'goodbye'
}

export default defineTRPCProcedure(b => b.query(async () => `${await sayGoodbye()} from TRPC`))
