export default ()=>({
    host:process.env.HOST,
    port:parseInt(process.env.DB_PORT as string,10),
    database:process.env.DATABASE_NAME,
    user:process.env.USER,
    password:process.env.PASSWORD,
});