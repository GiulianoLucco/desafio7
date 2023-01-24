const express = require("express");

const rutasInfo = express.Router();

rutasInfo.get("/info", (req, res) => {
  const idProcess = process.pid;
  const sistOpe = process.platform;
  const useMemori = process.memoryUsage();
  const versionNode = process.version;
  const carpetaProye = process.cwd();
  const pathEjec = process.execPath;
  const numCpus = require("os").cpus().length;

  res.render(path.join(process.cwd(), "/public/views/info.hbs"), {
    idProcess: idProcess,
    sistOpe: sistOpe,
    useMemori: useMemori,
    carpetaProye: carpetaProye,
    pathEjec: pathEjec,
    versionNode: versionNode,
    numCpus: numCpus,
  });
});

module.exports = { rutasInfo };
