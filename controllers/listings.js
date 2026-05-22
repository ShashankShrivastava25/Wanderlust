const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index.ejs", { allListing });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing does not exist");
    res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
  //console.log(listing);
};

module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;
  //console.log(url, "", filename);
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { filename, url };
  await newListing.save();
  //console.log(newListing);
  req.flash("success", "New Listing Created");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not exist");
    res.redirect("/listings");
  }
  //console.log(listing.image.url);
  let originalImageUrl = listing.image.url;
  //console.log(originalImageUrl);
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  //console.log(originalImageUrl);
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { filename, url };
    await listing.save();
  }
  //console.log(listing);
  req.flash("success", "Listings Updated");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deleted = await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
};

module.exports.filter = async (req, res, next) => {
  let { id } = req.params;
  let allListing = await Listing.find({ category: { $all: [id] } });
  if (allListing.length != 0) {
    res.locals.success = `Listing filtered by ${id}`;
    res.render("listings/index.ejs", { allListing });
  } else {
    req.flash("error", `There is no any Listing for ${id}`);
    res.redirect("/listings");
  }
};
