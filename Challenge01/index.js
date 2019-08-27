const express = require("express");

const server = express();

server.use(express.json());

const projects = [{ id: "1", title: "Projeto 1", tasks: [] }];

server.get("/projects", (req, res) => {
  return res.json(projects);
});

server.post("/projects", (req, res) => {
  const { project } = req.body;

  projects = projects.concat(project);

  return res.json(projects);
});

server.listen(3000);
