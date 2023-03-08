const Nations = require("../model/nation");
const Players = require("../model/player");
class NationController {
  index(req, res, next) {
    Nations.find({})
      .then((nations) => {
        res.render("nationSite", {
          title: "The list of Nations",
          nations: nations,
          isLogin: req.session.passport === undefined ? false : true
        });
      })
      .catch(next);
  }
  create(req, res, next) {
    const nation = new Nations(req.body);
    Nations.find({ name: nation.name }).then((nationCheck) => {
      if (nationCheck.length > 0) {
        req.flash("error_msg", "Duplicated! Nation name has already existed");
        res.redirect("/nations");
      } else {
        req.flash("success_msg", "Create a Nation successfully.");
        nation
          .save()
          .then(() => res.redirect("/nations"))
          .catch(next);
      }
    });
  }
  formEdit(req, res, next) {
    const nationId = req.params.nationId;
    Nations.findById(nationId)
      .then((nation) => {
        res.render("editNation", {
          title: "The detail of Nation",
          nation: nation,
          isLogin: req.session.passport === undefined ? false : true
        });
      })
      .catch(next);
  }
  edit(req, res, next) {
    Nations.updateOne({ _id: req.params.nationId }, req.body)
      .then(() => {
        req.flash("success_msg", "Info changed.");
        return res.redirect("/nations");
      })
      .catch((err) => {
        console.log("error update: ", err);
        req.flash("error_msg", "Duplicated! Nation name has already existed");
        res.redirect(`/nations/edit/${req.params.nationId}`);
      });
  }
  delete(req, res, next) {
    Players.find({ nation: req.params.nationId })
      .populate("nation")
      .then((data) => {
        if (data.length > 0) {
          req.flash(
            "error_msg",
            `Can not delete since some players belong to this country!`
          );
          return res.redirect("/nations");
        } else {
          Nations.findByIdAndDelete({ _id: req.params.nationId })
            .then(() => res.redirect("/nations"))
            .catch(next);
        }
      })
      .catch(next);
  }
}
module.exports = new NationController();
