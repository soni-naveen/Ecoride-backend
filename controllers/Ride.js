const Profile = require("../models/Profile");
const Ride = require("../models/Ride");
const User = require("../models/User");

//Create Ride handler function
exports.createRide = async (req, res) => {
  try {
    // Get user ID from request object
    const userId = req.user.id;

    //fetch data
    const {
      fromWhere,
      toWhere,
      date,
      leavingTime,
      noOfSeats,
      reachingTime,
      price,
    } = req.body;

    // Find the ride id
    const userDetails = await User.findById(userId);
    const ride = await Ride.findById(userDetails.ridePublished);

    //validation
    if (
      !fromWhere ||
      !toWhere ||
      !date ||
      !leavingTime ||
      !noOfSeats ||
      !reachingTime ||
      !price
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are Mandatory!",
      });
    }
    // Create a ride with the given details
    ride.fromWhere = fromWhere;
    ride.toWhere = toWhere;
    ride.date = date;
    ride.leavingTime = leavingTime;
    ride.noOfSeats = noOfSeats;
    ride.reachingTime = reachingTime;
    ride.price = price;

    await ride.save();

    const newRide = await User.findById(userId)
      .populate("additionalDetails")
      .populate("ridePublished")
      .exec();

    // Return the new ride and a success message
    return res.status(200).json({
      success: true,
      newRide,
      message: "Ride Created Successfully",
    });
  } catch (error) {
    // Handle any errors that occur during the creation of the ride
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create ride",
      error: error.message,
    });
  }
};

//Add Stop Point handler function
exports.addStopPoint = async (req, res) => {
  try {
    //fetch data
    let { stopPoint1, stopPoint2, stopPoint3 } = req.body;

    // Get user ID from request object
    const userId = req.user.id;

    // Find the ride id
    const userDetails = await User.findById(userId);
    const ride = await Ride.findById(userDetails.ridePublished);

    ride.stopPoint1 = stopPoint1 || "";
    ride.stopPoint2 = stopPoint2 || "";
    ride.stopPoint3 = stopPoint3 || "";

    await ride.save();

    const rideStopPoint = await User.findById(userId)
      .populate("additionalDetails")
      .populate("ridePublished")
      .exec();

    // Return the add stop point a success message
    return res.status(200).json({
      success: true,
      rideStopPoint,
      message: "Stop points added Successfully",
    });
  } catch (error) {
    // Handle any errors that occur during add stop point
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to add stop points",
      error: error.message,
    });
  }
};

//Delete Ride handler function
exports.deleteRide = async (req, res) => {
  try {
    const id = req.user.id;

    // Find the ride id
    const userDetails = await User.findById(id);
    const ride = await Ride.findById(userDetails.ridePublished);

    // delete ride details
    ride.fromWhere = "";
    ride.toWhere = "";
    ride.date = "";
    ride.leavingTime = "";
    ride.noOfSeats = 0;
    ride.reachingTime = "";
    ride.price = 0;
    ride.stopPoint1 = "";
    ride.stopPoint2 = "";
    ride.stopPoint3 = "";

    await ride.save();

    const updatedRideDetails = await User.findById(id)
      .populate("additionalDetails")
      .populate("ridePublished")
      .exec();

    return res.json({
      success: true,
      message: "Ride deleted successfully",
      updatedRideDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

//Automatically delete Ride handler function
exports.autoDeleteRide = async (req, res) => {
  try {
    const id = req.user.id;

    // Find the ride id
    const userDetails = await User.findById(id);
    const profile = await Profile.findById(userDetails.additionalDetails);
    const ride = await Ride.findById(userDetails.ridePublished);

    // delete ride details
    ride.fromWhere = "";
    ride.toWhere = "";
    ride.date = "";
    ride.leavingTime = "";
    ride.noOfSeats = 0;
    ride.reachingTime = "";
    ride.price = 0;
    ride.stopPoint1 = "";
    ride.stopPoint2 = "";
    ride.stopPoint3 = "";

    //update the ride count
    profile.noOfRidesPublished = profile.noOfRidesPublished + 1;

    await profile.save();
    await ride.save();

    const updatedRideDetails = await User.findById(id)
      .populate("additionalDetails")
      .populate("ridePublished")
      .exec();

    return res.json({
      success: true,
      message: "Ride deleted successfully",
      updatedRideDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

//Searched rides handler function
exports.getSearchedRides = async (req, res) => {
  try {
    const { st, dt, date, seats } = req.body;

    // Validate inputs
    if (!st || !dt || !date || !seats) {
      return res.status(400).json({
        success: false,
        error: "Require all fields!",
      });
    }

    // Find rides that match the search criteria
    const searchedRides = await Ride.find({
      $or: [
        {
          $and: [
            { fromWhere: st },
            {
              $or: [
                { stopPoint1: dt },
                { stopPoint1: dt },
                { stopPoint3: dt },
                { toWhere: dt },
              ],
            },
          ],
        },
        {
          $and: [
            { stopPoint1: st },
            { $or: [{ stopPoint2: dt }, { stopPoint3: dt }, { toWhere: dt }] },
          ],
        },
        {
          $and: [
            { stopPoint2: st },
            { $or: [{ stopPoint3: dt }, { toWhere: dt }] },
          ],
        },
        {
          $and: [{ stopPoint3: st }, { toWhere: dt }],
        },
      ],
      date: date,
      noOfSeats: { $gte: seats },
    })
      .populate("profile")
      .exec();

    return res.status(200).json({
      success: true,
      data: searchedRides,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

//Get ride details handler function
exports.getRideDetails = async (req, res) => {
  try {
    const { rideId } = req.body;

    const rideDetails = await Ride.findById(rideId).populate("profile").exec();

    if (!rideDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find profile with id: ${rideId}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: rideDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
