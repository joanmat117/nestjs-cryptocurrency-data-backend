
const config = {
  secretPhrase:{
    words:3,
    memorable:true
  },
  jwt:{
    accessTokenSecret:process.env.ACCESS_TOKEN_SECRET,
    refreshTokenSecret:process.env.REFRESH_TOKEN_SECRET
  }
} as const

export default config
