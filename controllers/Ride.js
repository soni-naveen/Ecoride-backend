const User = require("../models/User");
const Profile = require("../models/Profile");
const Ride = require("../models/Ride");
const BookedRide = require("../models/BookedRide");

//Create Ride handler function
exports.createRide = async (req, res) => {
  try {
    // Get user ID from request object
    const userId = req.user.id;

    //fetch data
    const {
      ["publishRideData[fromWhere]"]: fromWhere,
      ["publishRideData[toWhere]"]: toWhere,
      ["publishRideData[date]"]: date,
      ["publishRideData[leavingTime]"]: leavingTime,
      ["publishRideData[noOfSeats]"]: noOfSeats,
      ["publishRideData[reachingTime]"]: reachingTime,
      ["publishRideData[price]"]: price,
      ["stopPointData[stopPoint1]"]: stopPoint1,
      ["stopPointData[stopPoint2]"]: stopPoint2,
      ["stopPointData[stopPoint3]"]: stopPoint3,
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
    ride.stopPoint1 = stopPoint1 || "";
    ride.stopPoint2 = stopPoint2 || "";
    ride.stopPoint3 = stopPoint3 || "";

    await ride.save();

    const newRide = await User.findById(userId)
      .populate("additionalDetails")
      .populate("ridePublished")
      .exec();

    // Return the new ride and a success message
    return res.status(200).json({
      success: true,
      data: newRide,
      message: "Ride Created Successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create ride",
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

    // Split by comma, hyphen, or parentheses and trim any surrounding spaces
    const stFirstWord = st.split(/[, ]/)[0].trim();
    const dtFirstWord = dt.split(/[, ]/)[0].trim();

    // Create regex patterns for similar searches
    const stPattern = new RegExp(stFirstWord, "i"); // 'i' for case-insensitive,
    const dtPattern = new RegExp(dtFirstWord, "i");

    // Find rides that match the search criteria
    const searchedRides = await Ride.find({
      $or: [
        {
          $and: [
            { fromWhere: stPattern },
            {
              $or: [
                { stopPoint1: dtPattern },
                { stopPoint2: dtPattern },
                { stopPoint3: dtPattern },
                { toWhere: dtPattern },
              ],
            },
          ],
        },
        {
          $and: [
            { stopPoint1: stPattern },
            {
              $or: [
                { stopPoint2: dtPattern },
                { stopPoint3: dtPattern },
                { toWhere: dtPattern },
              ],
            },
          ],
        },
        {
          $and: [
            { stopPoint2: stPattern },
            { $or: [{ stopPoint3: dtPattern }, { toWhere: dtPattern }] },
          ],
        },
        {
          $and: [{ stopPoint3: stPattern }, { toWhere: dtPattern }],
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

//Send book request handler function
exports.sendBookRequest = async (req, res) => {
  try {
    const id = req.user.id;
    const { rideId } = req.body;
    const user = await User.findById(id);

    // Check if the ride exists
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    // Add the user to the pendingPassengers array of the ride
    const rideDetails = await Ride.findByIdAndUpdate(
      rideId,
      { $push: { pendingPassengers: user.additionalDetails } },
      { new: true }
    ).populate("pendingPassengers");

    const bookedRide = await BookedRide.findOneAndUpdate(
      { _id: user.rideBooked },
      {
        $set: {
          ride: rideId,
          profile: ride.profile,
          rideStatus: "Requested",
        },
      },
      { new: true }
    )
      .populate("ride")
      .populate("profile");

    return res.status(200).json({
      bookedRide,
      rideDetails,
      success: true,
      message: "Book request sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
