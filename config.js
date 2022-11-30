const config = {
  mongoRemote: {
    client: "Cluster0",
    cnxStr: process.env.DB_MONGO,
  },
};

module.exports = config;
