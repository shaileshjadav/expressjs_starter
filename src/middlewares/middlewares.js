var express = require("express");

module.exports = {
  init: async function(req, res, next) {
    res.locals.flashMessage = req.flash();
    next();
  },

  authentication: async (req, res, next) => {
    // passport stategries
    
    if ( await req.isAuthenticated()) {
      return next();
    }
    else{
      req.flash("error", "Login Required!");
      res.redirect("/login");
    }
   
  }
  
  
  // adminAuth: (req, res, next) => {
  //   if (req.session.admin) {
  //     next();
  //   } else {
  //     req.flash("error", "Login Required!");
  //     res.locals.flashMessage = req.flash();
  //     res.render("admin/login");
  //   }
  // }
};
