const config = {
  secretPhrase:{
    words:3,
    memorable:true
  },
  argon2:{
    memoryCost: 65536, 
    timeCost: 3,
    parallelism: 4,
    hashLength:32
  },
  jwt: {
    refreshToken:{
      cookieName:"udssrt",
      expiresIn: 30 * 24 * 60 * 60 // 30 days
    },
    accessToken:{
      cookieName:"ssaeat",
      expiresIn: 15 * 60 // 15 seconds
    }
  }
} as const

export default config
