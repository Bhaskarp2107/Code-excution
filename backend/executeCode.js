const Docker = require("dockerode");
const fs = require("fs");
const path = require("path");
const docker = new Docker();

module.exports = async function executePython(code, input) {
  const filename = `script-${Date.now()}.py`;
  const codePath = path.join(__dirname, filename);
  fs.writeFileSync(codePath, code);

  const inputFilename = `input-${Date.now()}.txt`;
  const inputPath = path.join(__dirname, inputFilename);
  fs.writeFileSync(inputPath, input);

  const container = await docker.createContainer({
    Image: "python:3.11",
    Tty: false,
    Cmd: ["python", `/${filename}`],
    HostConfig: {
      AutoRemove: true,
      Binds: [`${__dirname}:/`],
    }
  });

  const stream = await container.attach({ stream: true, stdout: true, stderr: true, stdin: true });
  await container.start();

  if (input) {
    stream.write(input);
    stream.end();
  }

  return new Promise((resolve, reject) => {
    let output = "";
    stream.on("data", (chunk) => output += chunk.toString());
    container.wait((err) => {
      fs.unlinkSync(codePath);
      fs.unlinkSync(inputPath);
      if (err) reject(err);
      resolve(output);
    });
  });
};
