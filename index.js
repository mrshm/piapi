const fs = require("fs");
const util = require("util");
const path = require("path");
const morgan = require("morgan");
const { exec } = require("child_process");

const express = require("express");

const PORT = 8080;

const app = express();

class Server {
  static async Log(message) {
    if (!fs.existsSync(path.resolve("./logs")))
      fs.mkdirSync(path.resolve("./logs"));

    message = new Date().toLocaleString("ir") + "\t" + message;

    fs.appendFile(path.resolve("./logs/log.txt"), message + "\n", (error) => {
      if (error) console.log(error);
      console.log(message);
    });
  }

  static Run() {
    app.use(
      express.json({
        limit: "10mb",
      })
    );
    app.use(
      express.urlencoded({
        extended: false,
        limit: "10mb",
      })
    );

    app.use(
      morgan(
        ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :response-time ms :res[content-length] ":referrer" ":user-agent"'
      )
    );

    app.get("/gpio", (req, res) => {
      try {
        exec(`gpio readall`, (err, stdout, stderr) => {
          if (err) throw err;

          if (stderr) throw stderr;

          res.status(200).json({
            response: stdout,
          });
        });
      } catch (error) {
        this.Log(error);
      }
    });

    app.get("/gpio/:pin", (req, res) => {
      try {
        if (!req.params.pin) throw "Wrong request. Undefined pin!";

        exec(`gpio read ${req.params.pin}`, (err, stdout, stderr) => {
          if (err) throw err;

          if (stderr) throw stderr;

          res.status(200).json({
            response: stdout,
          });
        });
      } catch (error) {
        this.Log(error);
      }
    });

    app.post("/gpio/write", (req, res) => {
      try {
        if (!req.body.pin || !req.body.state)
          throw "Wrong request. Undefined pin!";

        exec(
          `gpio write ${req.params.pin} ${req.body.state ? 1 : 0}`,
          (err, stdout, stderr) => {
            if (err) throw err;

            if (stderr) throw stderr;

            res.status(200).json({
              response: stdout,
            });
          }
        );
      } catch (error) {
        this.Log(error);
      }
    });

    app.post("/gpio/mode", (req, res) => {
      try {
        if (!req.body.pin || !req.body.state)
          throw "Wrong request. Undefined pin!";

        exec(
          `gpio write ${req.params.pin} ${req.body.state}`,
          (err, stdout, stderr) => {
            if (err) throw err;

            if (stderr) throw stderr;

            res.status(200).json({
              response: stdout,
            });
          }
        );
      } catch (error) {
        this.Log(error);
      }
    });

    app.all("*", (req, res) => {
      res.status(404).send("Not Found!");
    });

    app.listen(PORT, () => {
      this.Log(`Server running on port http ${PORT}`);
    });
  }
}

Server.Run();
