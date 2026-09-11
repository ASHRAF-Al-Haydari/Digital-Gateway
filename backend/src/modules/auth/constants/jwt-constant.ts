
export const JwtConstant:{
    secret:string
}={
    secret: process.env.JWT_SECRET_KEY as string,
}