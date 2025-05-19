const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post('/run', (req, res) => {
  const code = req.body.code;
  const input = req.body.input || "";

  const fs = require('fs');
  const path = require('path');
  const filename = `code_${Date.now()}.py`;
  const filepath = path.join(__dirname, filename);

  // Write code to temp file
  fs.writeFileSync(filepath, code);

  // Run python code
  const command = `python ${filename}`;

  exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
    // Clean up file
    fs.unlinkSync(filepath);

    if (error) {
      return res.status(500).json({ error: stderr || error.message });
    }

    res.json({ output: stdout });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
