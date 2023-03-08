const Players = require("../model/player");
const Nations = require("../model/nation");

let clubData = [
  { id: "1", name: "Arsenal" },
  { id: "2", name: "Manchester United" },
  { id: "3", name: "Chelsea" },
  { id: "4", name: "Manchester City" },
  { id: "5", name: "PSG" },
  { id: "6", name: "Inter Milan" },
  { id: "7", name: "Real Madrid" },
  { id: "8", name: "Barcelona" },
];
let postitionData = [
  { id: "1", name: "GK" },
  { id: "2", name: "CB" },
  { id: "3", name: "LB" },
  { id: "4", name: "RB" },
  { id: "5", name: "SW" },
  { id: "6", name: "CM" },
  { id: "7", name: "LM" },
  { id: "8", name: "RM" },
  { id: "9", name: "ST" },
  { id: "10", name: "LW" },
  { id: "11", name: "RW" },
];
class PlayerController {
  home(req, res, next) {
    console.log(req.session);
    Nations.find({})
      .then((nations) => {
        Players.find({ isCaptain: true })
          .populate("nation", ["name", "description"])
          .then((players) => {
            res.render("index", {
              title: "The list of Players",
              players: players,
              positionList: postitionData,
              clubList: clubData,
              nationsList: nations,
              isLogin: req.session.passport === undefined ? false : true,
            });
          })
          .catch((err) => {
            console.log(err);
            next();
          });
      })
      .catch((err) => {
        console.log(err);
        next();
      });
  }
  index(req, res, next) {
    Nations.find({})
      .then((nations) => {
        Players.find({})
          .populate("nation", ["name", "description"])
          .then((players) => {
            res.render("playerSite", {
              title: "The list of Players",
              players: players,
              positionList: postitionData,
              clubList: clubData,
              nationsList: nations,
              isLogin: req.session.passport === undefined ? false : true,
            });
          })
          .catch((err) => {
            console.log(err);
            next();
          });
      })
      .catch((err) => {
        console.log(err);
        next();
      });
  }
  create(req, res, next) {
    Nations.find({})
      .then((nations) => {
        if (nations.length === 0) {
          req.flash(
            "error_msg",
            "Please input data of nations in Database first!!!"
          );
          return res.redirect("/players");
        }
      })
      .catch((err) => {
        req.flash("error_msg", "Server Error");
        return res.redirect("/players");
      });
    var data = {
      name: req.body.name,
      image:
        req.file === undefined
          ? ""
          : `/images/Players/${req.file.originalname}`,
      career: req.body.career,
      position: req.body.position,
      goals: req.body.goals,
      nation: req.body.nation,
      isCaptain: req.body.isCaptain === undefined ? false : true,
    };
    console.log("data: ", data);
    const player = new Players(data);
    Players.find({ name: player.name }).then((playerCheck) => {
      if (playerCheck.length > 0) {
        req.flash("error_msg", "Duplicate player name!");
        res.redirect("/players");
      } else {
        console.log(player);
        player
          .save()
          .then(() => res.redirect("/players"))
          .catch(next);
      }
    });
  }
  playerDetail(req, res, next) {
    const playerId = req.params.playerId;
    Nations.find({})
      .then((nations) => {
        Players.findById(playerId)
          .populate("nation", "name")
          .then((player) => {
            res.render("playerDetail", {
              title: "The detail of Player",
              player: player,
              positionList: postitionData,
              clubList: clubData,
              nationsList: nations,
              isLogin: req.session.passport === undefined ? false : true,
            });
          })
          .catch(next);
      })
      .catch(next);
  }
  formEdit(req, res, next) {
    const playerId = req.params.playerId;
    Nations.find({})
      .then((nations) => {
        Players.findById(playerId)
          .then((player) => {
            res.render("editPlayer", {
              title: "The detail of Player",
              player: player,
              positionList: postitionData,
              clubList: clubData,
              nationsList: nations,
              isLogin: req.session.passport === undefined ? false : true,
            });
          })
          .catch(next);
      })
      .catch(next);
  }
  edit(req, res, next) {
    var data;
    if (!req.file) {
      data = {
        name: req.body.name,
        career: req.body.career,
        position: req.body.position,
        goals: req.body.goals,
        nation: req.body.nation,
        isCaptain: req.body.isCaptain === undefined ? false : true,
      };
    } else {
      data = {
        name: req.body.name,
        image: `/images/Players/${req.file.originalname}`,
        career: req.body.career,
        position: req.body.position,
        goals: req.body.goals,
        nation: req.body.nation,
        isCaptain: req.body.isCaptain === undefined ? false : true,
      };
    }
    Players.updateOne({ _id: req.params.playerId }, data)
      .then(() => {
        res.redirect("/players");
      })
      .catch((err) => {
        console.log("error update: ", err);
        req.flash("error_msg", "Duplicate player name!");
        res.redirect(`/players/edit/${req.params.playerId}`);
      });
  }
  delete(req, res, next) {
    Players.findByIdAndDelete({ _id: req.params.playerId })
      .then(() => res.redirect("/players"))
      .catch(next);
  }
}
module.exports = new PlayerController();
